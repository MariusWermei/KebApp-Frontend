import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Button from "../components/Button";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

import { useDispatch, useSelector } from "react-redux";
import { setPreferences } from "../reducers/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TAGS = [
  "poulet",
  "agneau",
  "veau",
  "mixte",
  "ouvert-tard",
  "veggie",
  "fait-maison",
  "best-seller",
  "petit-prix",
];

export default function OnboardingPreferences({ navigation }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleNext = async () => {
    // 1. Sauvegarde dans le store Redux (persisté automatiquement)
    dispatch(setPreferences(selectedTags));

    // 2. Sauvegarde en BDD si l'utilisateur est connecté
    if (token) {
      try {
        await fetch(`${API_URL}/users/preferences`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ preferences: selectedTags }),
        });
      } catch (error) {
        console.log("Erreur sauvegarde preferences:", error);
      }
    }

    navigation.navigate("OnboardingReady");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("Geolocation")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Qu'est-ce qui compte pour toi ?</Text>
      <Text style={styles.subtitle}>
        Sélectionne tes préférences pour des recommandations personnalisées.
      </Text>

      <View style={styles.tagsContainer}>
        {TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              selectedTags.includes(tag) && styles.tagSelected,
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Next →" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 25,
  },
  skipText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h2,
    color: colors.textDark,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  tagTextSelected: {
    fontFamily: fonts.family.bold,
    color: colors.textWhite,
  },
});
