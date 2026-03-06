import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../components/Button";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

import { useDispatch } from "react-redux";
import { useRef } from "react";
import { setHasOnboarded } from "../reducers/user";

export default function Geolocation({ navigation }) {
  const dispatch = useDispatch();
  const locationSubscriptionRef = useRef(null);

  const handleContinue = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    const status = result?.status;

    await AsyncStorage.setItem("locationPermission", status || "unknown");

    if (status === "granted") {
      // Mettre à jour la géolocalisation tous les 10 mètres
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10, // 10 mètres
        },
        async (location) => {
          await AsyncStorage.setItem(
            "userLocation",
            JSON.stringify(location.coords),
          );
        },
      );
    } else {
      await AsyncStorage.removeItem("userLocation");
    }

    dispatch(setHasOnboarded());
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("locationPermission", "denied");
    dispatch(setHasOnboarded());
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/geolocation.png")}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title}>Activer la géolocalisation</Text>

      <Text style={styles.subtitle}>
        Trouvez les meilleurs kebabs autour de vous en un instant et commandez
        plus vite.
      </Text>

      <Button title="Activer" onPress={handleContinue} />

      <Pressable onPress={handleSkip}>
        <Text style={styles.skip}>Passer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 30,
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    textAlign: "center",
    color: colors.textLight,
    marginBottom: 30,
    lineHeight: 22,
  },
  skip: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    marginTop: 18,
    color: colors.textLight,
  },
});
