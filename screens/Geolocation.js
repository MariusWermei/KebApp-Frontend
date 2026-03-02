import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Geolocation({ navigation }) {
  const handleContinue = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    const status = result?.status;

    // On stocke le choix
    await AsyncStorage.setItem("locationPermission", status || "unknown");

    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});

      await AsyncStorage.setItem(
        "userLocation",
        JSON.stringify(location.coords),
      );
    } else {
      // Supprimer l'ancienne loc si elle existe
      await AsyncStorage.removeItem("userLocation");
    }

    navigation.replace("Main");
  };

  const handleSkip = async () => {
    // On considère "Passer" comme "denied"
    await AsyncStorage.setItem("locationPermission", "denied");
    navigation.replace("Main");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activer la géolocalisation</Text>

      <Text style={styles.subtitle}>
        Trouvez les meilleurs kebabs autour de vous en un instant et commandez
        plus vite.
      </Text>

      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Activer</Text>
      </Pressable>

      <Pressable onPress={handleSkip}>
        <Text style={styles.skip}>Passer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  subtitle: {
    textAlign: "center",
    color: "#8A94A6",
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    backgroundColor: "#E8622A",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
  skip: { marginTop: 18, color: "#8A94A6", fontSize: 16 },
});
