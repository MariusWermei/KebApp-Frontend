import { View, Button, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useEffect } from "react";
import { useSelector } from "react-redux";
export default function CommandesScreen({ navigation }) {
  const token = useSelector((state) => state.user.token);
  useEffect(() => {
    console.log("token:", token);
    fetch("http://192.168.100.94:3000/commandes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          console.log("orders:", data);
          console.log("orders:", data.orders);
        } else {
          console.error("Error fetching orders:", data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  }, []);
  return (
    <View style={styles.container}>
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
      <View style={styles.currentOrders}>
        <Text>Commandes en cours...</Text>
        <View style={styles.currentOrdersList}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    width: "100%",

    borderBlockColor: "black",
    borderBottomWidth: 2,
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {},

  titleText: {
    fontSize: fonts.size.h3,
    fontFamily: fonts.family.semibold,
    color: colors.black,
  },
});
