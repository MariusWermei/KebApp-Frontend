import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Button from "../components/Button";

const TAGS = [
  "poulet",
  "agneau",
  "veau",
  "mixte",
  "halal",
  "ouvert-tard",
  "veggie",
  "fait-maison",
  "best-seller",
  "petit-prix",
];

export default function OnboardingPreferences({ navigation }) {
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip */}
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

      {/* Grille de tags */}
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

      {/* Bouton */}
      <Button
        title="Next →"
        onPress={() => navigation.navigate("OnboardingReady")}
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
  skipButton: {
    position: "absolute",
    top: 60,
    right: 25,
  },
  skipText: {
    color: "#999",
    fontSize: 16,
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  tagSelected: {
    backgroundColor: "#E87A2D",
    borderColor: "#E87A2D",
  },
  tagText: {
    fontSize: 14,
    color: "#666",
  },
  tagTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
