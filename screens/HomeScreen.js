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
import MapView, { Marker } from "react-native-maps";

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
      // 1. Récupérer la position
      const locationStr = await AsyncStorage.getItem("userLocation");
      const userCoords = locationStr ? JSON.parse(locationStr) : null;
      setCoords(userCoords);
      console.log("COORDONNES DE L'UTILISATEUR =>>", userCoords);

      // 2. Fetch restaurants
      let restaurantsUrl = `${API_URL}/restaurants?limit=10`;

      if (search.trim()) {
        restaurantsUrl = `${API_URL}/restaurants?search=${search.trim()}`;
        // Pas de limit quand on cherche — on veut tous les résultats
      }

      if (selectedTags.length > 0) {
        // Si on a déjà un search, on ajoute les tags avec &
        // Sinon on commence les params avec ?
        const separator = restaurantsUrl.includes("?") ? "&" : "?";
        restaurantsUrl += `${separator}tags=${selectedTags.join(",")}`;
      }

      if (userCoords) {
        restaurantsUrl += `&latitude=${userCoords.latitude}&longitude=${userCoords.longitude}`;
      }

      const restoResponse = await fetch(restaurantsUrl);
      const restoData = await restoResponse.json();
      if (restoData.result) {
        setRestaurants(restoData.restaurants);
      }

      // 3. Fetch recommandations (seulement si PAS de tags sélectionnés + connecté + préférences)
      console.log(" Check recommendations:", {
        selectedTags: selectedTags.length,
        token: !!token,
        preferences: preferences.length,
      });

      if (
        selectedTags.length === 0 &&
        !search.trim() &&
        token &&
        preferences.length > 0
      ) {
        let recoUrl = `${API_URL}/restaurants/recommendations?tags=${preferences.join(",")}&limit=10`;
        if (userCoords) {
          recoUrl += `&latitude=${userCoords.latitude}&longitude=${userCoords.longitude}`;
        }

        const recoResponse = await fetch(recoUrl);
        const recoData = await recoResponse.json();

        if (recoData.result) {
          setRecommendations(recoData.restaurants);
        } else {
          console.log(" Recommendations error:", recoData.error);
        }
      } else {
        console.log(" Skipping recommendations (conditions not met)");
      }
    }

    fetchData();
  }, [token, preferences, selectedTags, search]);

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
          <MapView
            style={styles.miniMap}
            initialRegion={{
              latitude: coords?.latitude || 48.8566,
              longitude: coords?.longitude || 2.3522,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            showsUserLocation={true}
            pointerEvents="none"
          >
            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant._id}
                coordinate={{
                  latitude: restaurant.location.coordinates[1],
                  longitude: restaurant.location.coordinates[0],
                }}
              >
                <View style={styles.miniMarker} />
              </Marker>
            ))}
          </MapView>
          <View style={styles.mapOverlay}>
            <Ionicons name="map-outline" size={18} color={colors.textWhite} />
            <Text style={styles.mapOverlayText}>Voir la carte</Text>
          </View>
        </TouchableOpacity>

        {selectedTags.length > 0 || search.trim() ? (
          // MODE FILTRE : compteur + bouton reset + liste verticale
          <>
            <View style={styles.filterHeader}>
              <Text style={styles.counterText}>
                {search.trim()
                  ? `Résultats pour "${search.trim()}"`
                  : `${restaurants.length} résultats`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTags([]);
                  setSearch("");
                }}
              >
                <Text style={styles.resetText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>

            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                variant="vertical"
                onPress={() =>
                  navigation.navigate("Restaurant", {
                    restaurantName: restaurant.name,
                  })
                }
              />
            ))}
          </>
        ) : (
          // MODE NORMAL : recommandations + carousel restaurants
          <>
            <Text style={styles.recommandationsTitle}>Recommandations</Text>

            {token && preferences.length > 0 ? (
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
                    onPress={() =>
                      navigation.navigate("Restaurant", {
                        restaurantName: restaurant.name,
                      })
                    }
                    preferences={preferences}
                  />
                ))}
              </ScrollView>
            ) : (
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
                  onPress={() =>
                    navigation.navigate("Restaurant", {
                      restaurantName: restaurant.name,
                    })
                  }
                />
              ))}
            </ScrollView>
          </>
        )}
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
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 36,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  miniMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.textWhite,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  mapOverlayText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.caption,
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
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  counterText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  resetText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.small,
    color: colors.primary,
  },
});
