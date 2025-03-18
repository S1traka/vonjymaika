"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"

const PaymentScreen = ({ navigation, route }) => {
  const { amount, service } = route.params
  const [paymentMethod, setPaymentMethod] = useState("VISA")
  const [cardNumber, setCardNumber] = useState("")
  const [securityCode, setSecurityCode] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [loading, setLoading] = useState(false)

  const formatCardNumber = (text) => {
    // Supprimer tous les espaces
    const cleaned = text.replace(/\s+/g, "")
    // Ajouter un espace tous les 4 chiffres
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim()
    return formatted
  }

  const handleCardNumberChange = (text) => {
    // Limiter à 19 caractères (16 chiffres + 3 espaces)
    if (text.replace(/\s+/g, "").length <= 16) {
      setCardNumber(formatCardNumber(text))
    }
  }

  const handleSecurityCodeChange = (text) => {
    // Limiter à 4 chiffres
    if (text.length <= 4 && /^\d*$/.test(text)) {
      setSecurityCode(text)
    }
  }

  const handleExpiryDateChange = (text) => {
    // Format MM/YY
    const cleaned = text.replace(/[^\d]/g, "")
    if (cleaned.length <= 4) {
      if (cleaned.length > 2) {
        setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`)
      } else {
        setExpiryDate(cleaned)
      }
    }
  }

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 16) {
      Alert.alert("Erreur", "Veuillez entrer un numéro de carte valide")
      return false
    }

    if (!securityCode || securityCode.length < 3) {
      Alert.alert("Erreur", "Veuillez entrer un code de sécurité valide")
      return false
    }

    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert("Erreur", "Veuillez entrer une date d'expiration valide")
      return false
    }

    if (!cardholderName) {
      Alert.alert("Erreur", "Veuillez entrer le nom du titulaire de la carte")
      return false
    }

    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // Simuler une requête de paiement
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Ici, vous pourriez intégrer un vrai service de paiement

      Alert.alert("Paiement réussi", `Votre paiement de ${amount} Ar pour ${service} a été traité avec succès.`, [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ])
    } catch (error) {
      console.error("Erreur de paiement:", error)
      Alert.alert("Erreur", "Une erreur est survenue lors du traitement du paiement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Résumé de la commande</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{service}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Montant:</Text>
          <Text style={styles.summaryValue}>{amount} Ar</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formLabel}>Mode de paiement</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={paymentMethod}
            onValueChange={(itemValue) => setPaymentMethod(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="VISA" value="VISA" />
            <Picker.Item label="MasterCard" value="MasterCard" />
            <Picker.Item label="Mobile Money" value="MobileMoney" />
          </Picker>
        </View>

        {(paymentMethod === "VISA" || paymentMethod === "MasterCard") && (
          <>
            <Text style={styles.formLabel}>Numéro de carte</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="number-pad"
            />

            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <Text style={styles.formLabel}>Date d'expiration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.formLabel}>Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={securityCode}
                  onChangeText={handleSecurityCodeChange}
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Nom du titulaire</Text>
            <TextInput
              style={styles.input}
              placeholder="NOM Prénom"
              value={cardholderName}
              onChangeText={setCardholderName}
            />
          </>
        )}

        {paymentMethod === "MobileMoney" && (
          <>
            <Text style={styles.formLabel}>Numéro de téléphone</Text>
            <TextInput style={styles.input} placeholder="+261 XX XX XXX XX" keyboardType="phone-pad" />
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>{loading ? "Traitement en cours..." : "Confirmer"}</Text>
      </TouchableOpacity>

      <View style={styles.securityInfo}>
        <Ionicons name="lock-closed" size={16} color="#757575" />
        <Text style={styles.securityText}>Vos informations de paiement sont sécurisées et cryptées</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  summaryContainer: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#424242",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#757575",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#424242",
  },
  formContainer: {
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 15,
    color: "#424242",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfColumn: {
    width: "48%",
  },
  payButton: {
    backgroundColor: "#2E7D32",
    height: 50,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  payButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 12,
    color: "#757575",
    marginLeft: 5,
    textAlign: "center",
  },
})

export default PaymentScreen

