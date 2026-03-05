import { useCallback } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import colors from "./constants/colors";

// Redux + Persist
import { Provider, useSelector } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import user from "./reducers/user";
import cart from "./reducers/cart";

// Screens
import RestaurantScreen from "./screens/RestaurantScreen";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import CommandesScreen from "./screens/CommandesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Geolocation from "./screens/Geolocation";
import OnboardingWelcome from "./screens/OnboardingWelcome";
import OnboardingPreferences from "./screens/OnboardingPreferences";
import OnboardingReady from "./screens/OnboardingReady";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import RestaurantsList from "./screens/RestaurantsList";

// Config redux-persist
const persistConfig = {
  key: "kebapp",
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({ user, cart }),
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
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

// Composant séparé pour accéder au store Redux avec useSelector
function AppNavigator() {
  const hasOnboarded = useSelector((state) => state.user.hasOnboarded);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasOnboarded ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
<<<<<<< HEAD
          <Stack.Screen name="RestaurantsList" component={RestaurantsList} />
=======
          <Stack.Screen name="Restaurant" component={RestaurantScreen} />
>>>>>>> c5b33cae76d8ce90e04d22c36f6889e189e7f06b
        </>
      ) : (
        <>
          <Stack.Screen
            name="OnboardingWelcome"
            component={OnboardingWelcome}
          />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen
            name="OnboardingPreferences"
            component={OnboardingPreferences}
          />
          <Stack.Screen name="OnboardingReady" component={OnboardingReady} />
          <Stack.Screen name="Geolocation" component={Geolocation} />
          <Stack.Screen name="Main" component={TabNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </PersistGate>
    </Provider>
  );
}

//   PersistGate — il attend que le store soit rechargé depuis AsyncStorage avant d'afficher l'app.
// Comme ça on sait si hasOnboarded est true ou false avant de décider quel screen afficher.
//  AppNavigator en composant séparé — on ne peut pas utiliser useSelector dans App directement car useSelector a besoin d'être à l'intérieur du Provider.
// C'est pour ça qu'on extrait la navigation dans un composant enfant.
//   Navigation conditionnelle — si hasOnboarded est true, la Stack ne contient que Main.
// L'utilisateur ne voit plus aucun screen d'onboarding. Si false, il a le flow complet.
