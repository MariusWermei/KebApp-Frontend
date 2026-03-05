import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>HomeScreen</Text>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Restaurant", {
            restaurantName: "La Broche - Kebab Berlinois Paris 5",
          })
        }
      >
        <Text>Go to Restaurant</Text>
      </TouchableOpacity>
    </View>
  );
}
