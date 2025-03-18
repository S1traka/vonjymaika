"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"
import OfflineService from "../services/offlineService"
import RewardService, { REWARD_TYPES } from "../services/rewardService"
import { hasPermission } from "../utils/permissions"

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [incidentTitle, setIncidentTitle] = useState("")
  const [incidentDescription, setIncidentDescription] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [address, setAddress] = useState("")
  const [isOffline, setIsOffline] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)
  const [user, setUser] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    loadUserData()
    checkConnectivity()
    loadMapData()

    // Vérifier périodiquement la connectivité
    const intervalId = setInterval(checkConnectivity, 10000)

    return () => clearInterval(intervalId)
  }, [])

  // Vérifier la connectivité et synchroniser si nécessaire
  const checkConnectivity = async () => {
    try {
      const connected = await OfflineService.isConnected()
      setIsOffline(!connected)

      if (connected) {
        // Synchroniser les incidents en attente
        const syncNeeded = await OfflineService.isSyncNeeded()
        if (syncNeeded) {
          const result = await OfflineService.syncPendingIncidents()
          if (result.synced > 0 || result.failed > 0) {
            setSyncStatus(`Synchronisé: ${result.synced}, Échec: ${result.failed}`)
            // Recharger les incidents après synchronisation
            await loadIncidents()
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connectivité:", error)
    }
  }

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user")
      if (userJson) {
        setUser(JSON.parse(userJson))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur:", error)
    }
  }

  const loadMapData = async () => {
    setLoading(true)
    try {
      // Demander la permission de localisation
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire pour utiliser cette fonctionnalité")
        setLoading(false)
        return
      }

      // Obtenir la position actuelle
      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation.coords)

      // Charger les incidents à proximité
      await loadIncidents(currentLocation.coords)
    } catch (error) {
      console.error("Erreur lors du chargement des données de la carte:", error)

      // En cas d'erreur, essayer de charger les incidents en cache
      const cachedIncidents = await OfflineService.getCachedIncidents()
      if (cachedIncidents.length > 0) {
        setIncidents(cachedIncidents)
        Alert.alert(
          "Mode hors ligne",
          "Affichage des incidents en cache. Certaines fonctionnalités peuvent être limitées.",
        )
      } else {
        Alert.alert("Erreur", "Impossible de charger les données de la carte")
      }
    } finally {
      setLoading(false)
    }
  }

  const loadIncidents = async (coords = null) => {
    try {
      const token = await AsyncStorage.getItem("token")
      const coordinates = coords || location

      if (!coordinates) {
        throw new Error("Position non disponible")
      }

      const response = await fetch(
        `${API_URL}/api/incidents/nearby?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&radius=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du chargement des incidents")
      }

      setIncidents(data)

      // Mettre en cache les incidents pour le mode hors ligne
      await OfflineService.cacheIncidents(data)
    } catch (error) {
      console.error("Erreur lors du chargement des incidents:", error)

      if (isOffline) {
        // En mode hors ligne, charger les incidents en cache
        const cachedIncidents = await OfflineService.getCachedIncidents()
        setIncidents(cachedIncidents)
      } else {
        throw error
      }
    }
  }

  const handleMapLongPress = async (event) => {
    const { coordinate } = event.nativeEvent
    setSelectedLocation(coordinate)

    // Vérifier si l'utilisateur a la permission de signaler un incident
    if (user && !hasPermission(user.role, "REPORT_EVENT")) {
      Alert.alert("Accès refusé", "Vous n'avez pas la permission de signaler des incidents.")
      return
    }

    try {
      if (isOffline) {
        // En mode hors ligne, utiliser une adresse générique
        setAddress("Adresse non disponible en mode hors ligne")
        setModalVisible(true)
        return
      }

      // Obtenir l'adresse pour la position sélectionnée
      const response = await fetch(
        `${API_URL}/api/incidents/geocode/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}`,
      )

      const data = await response.json()

      if (data && data.display_name) {
        setAddress(data.display_name)
      } else {
        setAddress("Adresse inconnue")
      }

      setModalVisible(true)
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error)
      setAddress("Adresse inconnue")
      setModalVisible(true)
    }
  }

  const handleReportIncident = async () => {
    if (!incidentTitle) {
      Alert.alert("Erreur", "Veuillez entrer un titre pour l'incident")
      return
    }

    try {
      const incidentData = {
        title: incidentTitle,
        description: incidentDescription,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        severity: "medium",
      }

      if (isOffline) {
        // En mode hors ligne, sauvegarder l'incident localement
        const savedIncident = await OfflineService.saveIncidentOffline(incidentData)

        Alert.alert(
          "Incident enregistré hors ligne",
          "Votre signalement sera synchronisé automatiquement lorsque vous serez connecté à Internet.",
          [
            {
              text: "OK",
              onPress: () => {
                setModalVisible(false)
                setIncidentTitle("")
                setIncidentDescription("")
                setSelectedLocation(null)

                // Ajouter l'incident à la liste locale
                setIncidents((prevIncidents) => [...prevIncidents, savedIncident])
              },
            },
          ],
        )
        return
      }

      const token = await AsyncStorage.getItem("token")

      const response = await fetch(`${API_URL}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(incidentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du signalement de l'incident")
      }

      // Ajouter des points de récompense pour le signalement
      if (user) {
        try {
          await RewardService.addPoints(user.id, REWARD_TYPES.REPORT_INCIDENT)
        } catch (rewardError) {
          console.error("Erreur lors de l'ajout des points de récompense:", rewardError)
        }
      }

      Alert.alert("Succès", "Incident signalé avec succès", [
        {
          text: "OK",
          onPress: () => {
            setModalVisible(false)
            setIncidentTitle("")
            setIncidentDescription("")
            setSelectedLocation(null)

            // Recharger les incidents
            if (location) {
              loadIncidents(location)
            }
          },
        },
      ])
    } catch (error) {
      console.error("Erreur lors du signalement de l'incident:", error)
      Alert.alert("Erreur", "Impossible de signaler l'incident")
    }
  }

  const handleIncidentPress = (incident) => {
    navigation.navigate("IncidentDetails", { incident })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location ? location.latitude : -18.8792,
          longitude: location ? location.longitude : 47.5079,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleMapLongPress}
      >
        {/* Marqueur de position actuelle */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Ma position"
            pinColor="#2E7D32"
          />
        )}

        {/* Marqueurs des incidents */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: Number.parseFloat(incident.latitude),
              longitude: Number.parseFloat(incident.longitude),
            }}
            title={incident.title}
            description={incident.description}
            pinColor={incident.status === "pending_sync" ? "#FFC107" : "#D32F2F"}
            onPress={() => handleIncidentPress(incident)}
          />
        ))}
      </MapView>

      {/* Indicateur de mode hors ligne */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={16} color="#fff" />
          <Text style={styles.offlineText}>Mode hors ligne</Text>
        </View>
      )}

      {/* Indicateur de synchronisation */}
      {syncStatus && (
        <View style={styles.syncIndicator}>
          <Ionicons name="sync" size={16} color="#fff" />
          <Text style={styles.syncText}>{syncStatus}</Text>
        </View>
      )}

      {/* Bouton pour centrer la carte sur la position actuelle */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => {
          if (location && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            })
          }
        }}
      >
        <Ionicons name="locate" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bouton pour signaler un incident */}
      {user && hasPermission(user.role, "REPORT_EVENT") && (
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => {
            if (location) {
              setSelectedLocation(location)
              setModalVisible(true)
            } else {
              Alert.alert("Erreur", "Impossible de déterminer votre position")
            }
          }}
        >
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={styles.reportButtonText}>Signaler un incident</Text>
        </TouchableOpacity>
      )}

      {/* Modal pour signaler un incident */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Signaler un incident</Text>

            <Text style={styles.modalLabel}>Adresse</Text>
            <Text style={styles.addressText}>{address}</Text>

            <Text style={styles.modalLabel}>Titre</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Titre de l'incident"
              value={incidentTitle}
              onChangeText={setIncidentTitle}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Description de l'incident"
              value={incidentDescription}
              onChangeText={setIncidentDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleReportIncident}>
                <Text style={styles.confirmButtonText}>Signaler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#757575",
  },
  map: {
    flex: 1,
  },
  offlineIndicator: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  offlineText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  syncIndicator: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    backgroundColor: "#2196F3",
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  syncText: {
    color: "#fff",
    marginLeft: 5,
  },
  locationButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#2E7D32",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  reportButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  reportButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2E7D32",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#424242",
  },
  addressText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#2E7D32",
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#424242",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})

export default MapScreen

