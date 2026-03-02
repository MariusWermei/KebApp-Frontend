import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import CommandesScreen from "./screens/CommandesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Geolocation from "./screens/Geolocation"; // 👈 nouveau
import OnboardingWelcome from "./screens/OnboardingWelcome";
import OnboardingPreferences from "./screens/OnboardingPreferences";
import OnboardingReady from "./screens/OnboardingReady";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E8622A",
        tabBarInactiveTintColor: "#8A94A6",
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          if (route.name === "Home") iconName = "home";
          if (route.name === "Map") iconName = "map-outline";
          if (route.name === "Commandes") iconName = "bag-handle-outline";
          if (route.name === "Profile") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Commandes" component={CommandesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcome} />
        <Stack.Screen
          name="OnboardingPreferences"
          component={OnboardingPreferences}
        />
        <Stack.Screen name="OnboardingReady" component={OnboardingReady} />
        {/* 1) Page geo en premier */}
        <Stack.Screen name="Geolocation" component={Geolocation} />

        {/* 2) Puis ton app normale (tabs) */}
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
