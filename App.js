import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingWelcome from "./screens/OnboardingWelcome";
import OnboardingPreferences from "./screens/OnboardingPreferences";
import OnboardingReady from "./screens/OnboardingReady";

const Stack = createNativeStackNavigator();

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
