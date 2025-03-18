"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"
import io from "socket.io-client"

const IncidentDetailsScreen = ({ route, navigation }) => {
  const { incident } = route.params
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const socket = useRef(null)
  const flatListRef = useRef(null)

  useEffect(() => {
    // Charger les informations de l'utilisateur
    const loadUserInfo = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user")
        if (userJson) {
          setUser(JSON.parse(userJson))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des informations utilisateur:", error)
      }
    }

    // Charger les messages précédents
    const loadMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("token")

        const response = await fetch(`${API_URL}/api/chat/incident/${incident.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors du chargement des messages")
        }

        // Inverser l'ordre pour afficher les plus récents en bas
        setMessages(data.reverse())
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    // Configurer Socket.IO
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem("token")

      socket.current = io(API_URL, {
        query: { token },
        transports: ["websocket"],
      })

      socket.current.on("connect", () => {
        console.log("Connecté à Socket.IO")
        socket.current.emit("join-incident", incident.id)
      })

      socket.current.on("new-message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message])
        // Faire défiler vers le bas pour voir le nouveau message
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true })
        }
      })

      socket.current.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.IO:", error)
      })
    }

    loadUserInfo()
    loadMessages()
    setupSocket()

    // Nettoyage lors du démontage du composant
    return () => {
      if (socket.current) {
        socket.current.disconnect()
      }
    }
  }, [incident.id])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    try {
      const token = await AsyncStorage.getItem("token")

      // Envoyer le message via Socket.IO
      socket.current.emit("send-message", {
        incidentId: incident.id,
        userId: user.id,
        message: newMessage.trim(),
      })

      // Enregistrer également via l'API REST (redondance pour fiabilité)
      await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          incident_id: incident.id,
          message: newMessage.trim(),
        }),
      })

      setNewMessage("")
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
    }
  }

  const renderMessage = ({ item }) => {
    const isOwnMessage = user && item.user_id === user.id

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer]}>
        <View style={[styles.messageBubble, isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble]}>
          {!isOwnMessage && <Text style={styles.messageUsername}>{item.username}</Text>}
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{incident.title}</Text>
      </View>

      <View style={styles.incidentInfo}>
        <Text style={styles.incidentDescription}>{incident.description}</Text>
        <View style={styles.incidentMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="person" size={16} color="#757575" />
            <Text style={styles.metaText}>Signalé par: {incident.reporter_name}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color="#757575" />
            <Text style={styles.metaText}>{new Date(incident.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.metaItem, styles.statusContainer]}>
            <Text
              style={[styles.statusText, incident.status === "active" ? styles.statusActive : styles.statusResolved]}
            >
              {incident.status === "active" ? "Actif" : "Résolu"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chatContainer}>
        <Text style={styles.chatTitle}>Discussion</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={!newMessage.trim()}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  incidentInfo: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  incidentDescription: {
    fontSize: 16,
    color: "#424242",
    marginBottom: 10,
  },
  incidentMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 5,
  },
  metaText: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 5,
  },
  statusContainer: {
    marginLeft: "auto",
  },
  statusText: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  statusActive: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
  },
  statusResolved: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#424242",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  messagesContainer: {
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: "row",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
  },
  ownMessageBubble: {
    backgroundColor: "#e8f5e9",
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 5,
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 3,
  },
  messageText: {
    fontSize: 16,
    color: "#424242",
  },
  messageTime: {
    fontSize: 10,
    color: "#9e9e9e",
    alignSelf: "flex-end",
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#2E7D32",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default IncidentDetailsScreen

