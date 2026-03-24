import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CommandesScreen({ navigation }) {
  const token = useSelector((state) => state.user.token);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${apiUrl}/commandes`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.result && data.orders.length > 0) {
            setOrders(data.orders);
          }
        })
        .catch(() => {});

      fetch(`${apiUrl}/restaurants`)
        .then((res) => res.json())
        .then((data) => {
          if (data.result) setRestaurants(data.restaurants);
        })
        .catch(() => {});
    }, [refresh]),
  );

  const handleDevOrderUpdate = async (orderId) => {
    const response = await fetch(`${apiUrl}/commandes/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    const data = await response.json();
    if (!data.result) {
      console.log("Erreur mise à jour commande:", data.message);
    }
  };

  const getLogoUrl = (restaurantName) => {
    const resto = restaurants.find((r) => r.name === restaurantName);
    return resto?.photos?.[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.title}>
            <Text style={styles.titleText}>Vos commandes</Text>
          </View>
        </View>

        {/* Commandes en cours */}
        <View style={styles.currentOrdersContainer}>
          <Text style={styles.sectionTitle}>
            Commandes en cours{" "}
            <Text
              style={[
                styles.orangeDot,
                orders.filter((o) => !o.orderStatus.isFinalized).length ===
                  0 && { color: colors.textStrong },
              ]}
            >
              •
            </Text>
          </Text>

          {orders.filter((o) => !o.orderStatus.isFinalized).length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="file-tray-outline"
                size={48}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Aucune commande en cours</Text>
            </View>
          )}

          {orders
            .filter((o) => !o.orderStatus.isFinalized)
            .map((order) => (
              <View key={order._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {getLogoUrl(order.restaurant.name) ? (
                    <Image
                      source={{ uri: getLogoUrl(order.restaurant.name) }}
                      style={styles.logoPlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder} />
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.restaurantName}>
                      {order.restaurant.name}
                      {/* Bouton dev — à supprimer en prod */}
                      <TouchableOpacity
                        onPress={() => {
                          handleDevOrderUpdate(order._id, "DELIVERED");
                          setRefresh((prev) => prev + 1);
                        }}
                        style={styles.devButton}
                      >
                        <Text style={styles.devButtonText}>DELIVERED</Text>
                      </TouchableOpacity>
                    </Text>
                    <Text style={styles.orderNumber}>
                      N° de commande :{" "}
                      {order?.orderNumber?.slice(0, 3) +
                        "..." +
                        order?.orderNumber?.slice(-3)}
                    </Text>
                  </View>
                </View>

                {/* Barre de progression */}
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      order.orderStatus.step === "ACCEPTED" && { width: "33%" },
                      order.orderStatus.step === "PREPARING" && {
                        width: "66%",
                      },
                      order.orderStatus.step === "READY" && { width: "100%" },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text
                    style={[
                      styles.progressLabel,
                      order.orderStatus.step === "ACCEPTEE" &&
                        styles.activeStep,
                    ]}
                  >
                    ACCEPTÉE
                  </Text>
                  <Text
                    style={[
                      styles.progressLabel,
                      order.orderStatus.step === "PREPARING" &&
                        styles.activeStep,
                    ]}
                  >
                    EN PRÉPARATION
                  </Text>
                  <Text
                    style={[
                      styles.progressLabel,
                      order.orderStatus.step === "READY" && styles.activeStep,
                    ]}
                  >
                    PRÊTE
                  </Text>
                </View>

                <View style={styles.arrivalRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.primary}
                    style={styles.arrivalIcon}
                  />
                  <Text style={styles.arrivalText}>
                    Arrivée prévue à :{" "}
                    {order.estimatedArrivalTime
                      ? new Date(order.estimatedArrivalTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "Tqt ca arrive frère"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => setSelectedOrderId(order._id)}
                >
                  <Text style={styles.moreButtonText}>En savoir plus</Text>
                </TouchableOpacity>

                <Modal
                  visible={selectedOrderId === order._id}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setSelectedOrderId(null)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setSelectedOrderId(null)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                    >
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                          Détails de la commande
                        </Text>
                        <Text style={styles.modalItems}>
                          {order.items
                            .map((item) => `${item.quantity}x ${item.name}`)
                            .join("\n")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setSelectedOrderId(null)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              </View>
            ))}
        </View>

        {/* Commandes précédentes */}
        <Text style={[styles.sectionTitle, styles.pastOrdersTitle]}>
          Commandes précédentes
        </Text>
        <ScrollView style={styles.pastOrdersList}>
          {orders.filter((o) => o.orderStatus.isFinalized).length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="time-outline"
                size={48}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>
                Vos commandes apparaîtront ici une fois passées.
              </Text>
            </View>
          )}

          {orders
            .filter((o) => o.orderStatus.isFinalized)
            .map((order) => (
              <View key={order._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {getLogoUrl(order.restaurant.name) ? (
                    <Image
                      source={{ uri: getLogoUrl(order.restaurant.name) }}
                      style={styles.logoPlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder} />
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.restaurantName}>
                      {order.restaurant.name}
                    </Text>
                    <Text style={styles.orderDate}>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                            },
                          )
                        : "Date inconnue"}{" "}
                      • {(order.totalPrice / 100).toFixed(2)}€
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => setSelectedOrderId(order._id)}
                >
                  <Text style={styles.moreButtonText}>En savoir plus</Text>
                </TouchableOpacity>

                <Modal
                  visible={selectedOrderId === order._id}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setSelectedOrderId(null)}
                >
                  <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setSelectedOrderId(null)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                    >
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                          Détails de la commande
                        </Text>
                        <Text style={styles.modalItems}>
                          {order.items
                            .map((item) => `${item.quantity}x ${item.name}`)
                            .join("\n")}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setSelectedOrderId(null)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              </View>
            ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBg,
  },
  modalContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalContent: {
    width: "100%",
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 30,
    paddingHorizontal: 50,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
  closeButtonText: {
    color: colors.textWhite,
    fontWeight: "bold",
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  modalItems: {
    fontSize: 15,
    color: colors.textSubtle,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundLight,
  },
  backButton: { marginRight: 20 },
  title: { flex: 1, alignItems: "center" },
  titleText: {
    fontSize: fonts.size.large,
    fontWeight: "bold",
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.textStrong,
  },
  orangeDot: {
    color: colors.primary,
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: colors.primaryPale,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textStrong,
  },
  orderNumber: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.progressBg,
    borderRadius: 3,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.textFaintest,
    fontWeight: "600",
  },
  activeStep: {
    color: colors.primary,
    fontWeight: "bold",
  },
  arrivalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  arrivalText: {
    fontSize: 14,
    color: colors.textGray,
    marginLeft: 4,
  },
  moreButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  moreButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  currentOrdersContainer: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  pastOrdersTitle: {
    paddingLeft: 20,
  },
  pastOrdersList: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  cardInfo: {
    flex: 1,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  arrivalIcon: {
    marginRight: 4,
  },
  devButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  devButtonText: {
    color: colors.textWhite,
    fontSize: 7,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 13,
    color: colors.textFaint,
    marginTop: 2,
  },
});
