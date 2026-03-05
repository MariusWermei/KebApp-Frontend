import { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SearchBar from "../components/SearchBar";
import FilterTags from "../components/FilterTags";
import RestaurantCard from "../components/RestaurantCard";

export default function HomeScreen() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const navigation = useNavigation();

  const token = useSelector((state) => state.user.token);
  const preferences = useSelector((state) => state.user.preferences);

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log(preferences);
      // 1. Récupérer la position de l'utilisateur
      const locationStr = await AsyncStorage.getItem("userLocation");
      console.log("Location stockée :", locationStr);
      const userCoords = locationStr ? JSON.parse(locationStr) : null;
      setCoords(userCoords);

      // 2. Construire l'URL restaurants (avec ou sans géoloc)
      let restaurantsUrl = `${API_URL}/restaurants?limit=10`;
      if (userCoords) {
        restaurantsUrl += `&latitude=${userCoords.latitude}&longitude=${userCoords.longitude}`;
      }

      // 3. Fetch restaurants
      const restoResponse = await fetch(restaurantsUrl);
      const restoData = await restoResponse.json();
      if (restoData.result) {
        setRestaurants(restoData.restaurants);
      }

      // 4. Fetch recommandations (seulement si connecté + préférences)
      if (token && preferences.length > 0) {
        let recoUrl = `${API_URL}/restaurants/recommendations?tags=${preferences.join(",")}&limit=10`;
        if (userCoords) {
          recoUrl += `&latitude=${userCoords.latitude}&longitude=${userCoords.longitude}`;
        }

        const recoResponse = await fetch(recoUrl);
        const recoData = await recoResponse.json();
        if (recoData.result) {
          setRecommendations(recoData.restaurants);
        }
      }
    }

    fetchData();
  }, []);

  const toggleTag = (tag) => {
    // tag = le tag sur lequel l'utilisateur vient de cliquer (ex: "halal")

    setSelectedTags((prev) =>
      // prev = le tableau actuel des tags sélectionnés (ex: ["veggie", "halal"])

      prev.includes(tag)
        ? // Si le tag est DÉJÀ dans le tableau → on le RETIRE (désélection)
          // .filter() crée un nouveau tableau SANS ce tag
          prev.filter((t) => t !== tag)
        : // Si le tag N'EST PAS dans le tableau → on l'AJOUTE (sélection)
          // ...prev copie tous les tags existants + on ajoute le nouveau
          [...prev, tag],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={20} color={colors.primary} />
            <Text style={styles.locationText}>Paris, France</Text>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textDark}
            />
          </TouchableOpacity>
        </View>

        {/* SearchBar */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* FilterTags */}
        <FilterTags selected={selectedTags} onToggle={toggleTag} />

        <TouchableOpacity
          style={styles.mapPreview}
          onPress={() => navigation.navigate("Map")}
          activeOpacity={0.8}
        >
          <View style={styles.mapOverlay}>
            <Ionicons name="map-outline" size={22} color={colors.textWhite} />
            <Text style={styles.mapOverlayText}>APERÇU DE MAP</Text>
          </View>
        </TouchableOpacity>

        {/* Section Recommandations */}
        <Text style={styles.recommandationsTitle}>Recommandations</Text>

        {token && preferences.length > 0 ? (
          // L'utilisateur est connecté ET a des préférences → on affiche les recos
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {recommendations.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                variant="horizontal"
                onPress={() => {}}
                preferences={preferences}
              />
            ))}
          </ScrollView>
        ) : (
          // L'utilisateur n'est pas connecté OU n'a pas de préférences → message
          <View style={styles.recoMessage}>
            <Ionicons
              name="sparkles-outline"
              size={28}
              color={colors.textLight}
            />
            <Text style={styles.recoMessageText}>
              Connecte-toi et choisis tes préférences pour recevoir des
              recommandations personnalisées.
            </Text>
          </View>
        )}

        {/* Section Restaurants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.recommandationsTitle}>Restaurants</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("RestaurantsList")}
          >
            <Text style={styles.seeAll}>tout voir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              variant="horizontal"
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  mapPreview: {
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 36,
  },
  mapOverlay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  mapOverlayText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.textWhite,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  restaurantTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
  },
  recommandationsTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
    marginBottom: 12,
  },
  seeAll: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.primary,
  },
  carouselContent: {
    paddingRight: 20,
  },
});
