import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Button from "../components/Button";

export default function OnboardingWelcome({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Image */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Texte */}
      <Text style={styles.title}>Bienvenue sur KebApp</Text>
      <Text style={styles.subtitle}>
        Trouve les meilleurs kebabs autour de toi et commande en un clic.
      </Text>

      {/* Bouton Next */}
      <Button title="Next →" onPress={() => navigation.navigate("SignIn")} />
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
