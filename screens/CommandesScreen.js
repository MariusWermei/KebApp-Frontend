import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

export default function CommandesScreen({ navigation }) {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const token = useSelector((state) => state.user.token);

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 📥 Charger les commandes
  const loadCommandes = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/commandes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.result) {
        setCommandes(data.commandes || []);
      } else {
        setError(data.message || "Erreur lors du chargement des commandes");
      }
    } catch (err) {
      console.error("❌ Erreur chargement commandes:", err);
      setError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 Au montage du composant
  useEffect(() => {
    loadCommandes();
  }, []);

  // 🔄 Rafraîchissement manuel
  const onRefresh = () => {
    setRefreshing(true);
    loadCommandes();
  };

  // 📦 Rendu d'une commande
  const renderCommande = ({ item }) => {
    const date = new Date(item.date_commande);
    const formattedDate = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculer le nombre d'items
    const totalItems = item.items.reduce((sum, it) => sum + it.quantite, 0);

    // Couleur du statut
    const getStatusColor = () => {
      switch (item.statut?.etape) {
        case "ACCEPTEE":
          return colors.primary;
        case "EN_PREPARATION":
          return "#FFA500";
        case "PRETE":
          return "#4CAF50";
        case "LIVREE":
          return "#2196F3";
        default:
          return colors.textLight;
      }
    };

    return (
      <TouchableOpacity
        style={styles.commandeCard}
        onPress={() =>
          navigation.navigate("CommandeDetail", { commandeId: item._id })
        }
      >
        <View style={styles.commandeHeader}>
          <View>
            <Text style={styles.restaurantName}>{item.restaurant.nom}</Text>
            <Text style={styles.commandeDate}>{formattedDate}</Text>
          </View>
          <Text style={styles.prix}>{item.prix_total.toFixed(2)} €</Text>
        </View>

        <View style={styles.commandeBody}>
          <Text style={styles.itemsCount}>
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {item.statut?.etape || "EN COURS"}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.items.slice(0, 2).map((it, idx) => (
            <Text key={idx} style={styles.itemText}>
              • {it.nom} x{it.quantite}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.itemsMore}>
              + {item.items.length - 2} article{item.items.length - 2 > 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ⏳ États de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ❌ Erreur
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.primary} />
          <Text style={styles.errorTitle}>Oups !</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={loadCommandes}
          >
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes commandes</Text>
      </View>

      {commandes.length === 0 ? (
        // 📭 Aucune commande
        <View style={styles.centerContent}>
          <Ionicons
            name="fast-food-outline"
            size={48}
            color={colors.textLight}
          />
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyMessage}>
            Tu n'as pas encore commandé. Découvre nos restaurants !
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.browseBtnText}>Parcourir les restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 📋 Liste des commandes
        <FlatList
          data={commandes}
          renderItem={renderCommande}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: fonts.size.large,
    fontWeight: "700",
    color: colors.textDark,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: fonts.size.medium,
    color: colors.textLight,
    fontWeight: "500",
  },
  errorTitle: {
    fontSize: fonts.size.large,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: 16,
  },
  errorMessage: {
    fontSize: fonts.size.small,
    color: colors.textLight,
    marginTop: 8,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: fonts.size.medium,
  },
  listContent: {
    padding: 15,
  },
  commandeCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  commandeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: fonts.size.medium,
    fontWeight: "700",
    color: colors.textDark,
  },
  commandeDate: {
    fontSize: fonts.size.small,
    color: colors.textLight,
    marginTop: 4,
  },
  prix: {
    fontSize: fonts.size.medium,
    fontWeight: "700",
    color: colors.primary,
  },
  commandeBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemsCount: {
    fontSize: fonts.size.small,
    color: colors.textLight,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: fonts.size.small,
    fontWeight: "600",
  },
  itemsList: {
    marginTop: 8,
  },
  itemText: {
    fontSize: fonts.size.small,
    color: colors.textDark,
    marginBottom: 4,
  },
  itemsMore: {
    fontSize: fonts.size.small,
    color: colors.textLight,
    fontStyle: "italic",
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: fonts.size.large,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: fonts.size.small,
    color: colors.textLight,
    marginTop: 8,
    textAlign: "center",
  },
  browseBtn: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  browseBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: fonts.size.medium,
  },
});

