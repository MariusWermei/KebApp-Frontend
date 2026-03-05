import { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import RestaurantCard from "../components/RestaurantCard";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const token = useSelector((state) => state.user.token);
  const preferences = useSelector((state) => state.user.preferences);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.result) {
          setFavorites(data.favorites);
        }
      } catch (err) {
        console.log("Erreur fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.emptyText}>Chargement...</Text>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={56} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyText}>
              Ajoute des restaurants à tes favoris pour les retrouver ici.
            </Text>
          </View>
        ) : (
          favorites.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              variant="vertical"
              preferences={preferences}
              onPress={() =>
                navigation.navigate("Restaurant", {
                  restaurantName: restaurant.name,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F6F7FB",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  emptyText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
});
