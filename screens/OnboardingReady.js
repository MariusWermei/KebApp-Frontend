import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Button from "../components/Button";

export default function OnboardingReady({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/onboarding-ready.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.title}>Tu es prêt</Text>
      <Text style={styles.subtitle}>
        Découvre les meilleurs kebabs de Paris dès maintenant.
      </Text>

      <Button
        title="Get Started"
        onPress={() => navigation.navigate("Geolocation")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  image: {
    width: 300,
    height: 280,
    borderRadius: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
});
