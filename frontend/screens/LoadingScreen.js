import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native"

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>VonjyMaika</Text>
      <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      <Text style={styles.loadingText}>Chargement en cours...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 30,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#757575",
  },
})

export default LoadingScreen

