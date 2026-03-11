import {
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaViewBase,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
export default function CommandesScreen({ navigation }) {
  const token = useSelector((state) => state.user.token);
  const [orders, setOrders] = useState([]);
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
          const orders = data.orders;
          setOrders(orders);
          console.log("orders:", orders);
          console.log("data.orders:", orders[0].restaurant.name);
        } else {
          console.error("Error fetching orders:", data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
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
        {orders.map(
          (order) =>
            !order.orderStatus.isFinalized && (
              <View key={order._id}>
                <Text>{order.restaurant.name}</Text>
                <Text>
                  {order.estimatedArrivalTime
                    ? new Date(order.estimatedArrivalTime).toLocaleTimeString()
                    : "En attente"}
                </Text>
                <Text>{order.orderStatus.step}</Text>
                <Text>{(order.totalPrice / 100).toFixed(2)} €</Text>
                {/* autres infos */}
              </View>
            ),
        )}
        <View style={styles.pastOrders}>
          <Text>Commandes précédentes</Text>
          <View style={styles.pastOrdersList}></View>
          {orders.map(
            (order) =>
              order.orderStatus.isFinalized && (
                <View key={order._id}>
                  <Text>{order.restaurant.name}</Text>
                  <Text>
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </Text>
                  <Text>{(order.totalPrice / 100).toFixed(2)} €</Text>
                  {/* autres infos */}
                </View>
              ),
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    marginRight: 20,
  },
  title: {
    flex: 1,
    alignItems: "center",
  },
  titleText: {
    fontSize: fonts.size.large,
    fontWeight: "bold",
    color: colors.primary,
  },
  currentOrders: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  currentOrdersList: {
    marginTop: 10,
  },
});
