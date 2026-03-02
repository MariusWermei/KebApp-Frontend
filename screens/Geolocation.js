import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Geolocation({ navigation }) {
  const handleContinue = async () => {
    // ici on branchera la permission GPS après
    navigation.replace("Main"); // 👈 va vers tes tabs
  };

  const handleSkip = () => {
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
        <Text style={styles.buttonText}>Continuer</Text>
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
