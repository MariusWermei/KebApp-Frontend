import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SignInScreen() {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert("Erreur", "Username, email et mot de passe requis.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (data.result) {
        await AsyncStorage.setItem("token", data.token);
        navigation.replace("OnboardingPreferences"); // ✅ Onboarding
      } else {
        Alert.alert("Erreur", data.error || "Connexion impossible");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigation.goBack();
  const goToSignup = () => navigation.navigate("SignUp"); // adapte le nom de ta route

  const handleGoogle = () => {
    Alert.alert("Info", "Google login à brancher ensuite");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.card}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeBtn} onPress={goBack}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>

              {/* Logo */}
              <View style={styles.logoWrap}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoMark}>{"</>"}</Text>
                </View>
              </View>

              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Enter your details to access your account
              </Text>

              {/* Username */}
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose your username"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPwd}
                  style={[styles.input, { paddingRight: 44 }]}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd((v) => !v)}
                  hitSlop={10}
                >
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.85 }]}
                onPress={handleSignin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Signing In..." : "Login"}
                </Text>
              </TouchableOpacity>

              {/* Divider OR */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleGoogle}
              >
                <View style={styles.secondaryInner}>
                  <View style={styles.googleDot} />
                  <Text style={styles.secondaryText}>Continue with Google</Text>
                </View>
              </TouchableOpacity>

              {/* Bottom */}
              <TouchableOpacity
                style={styles.backRow}
                onPress={() => navigation.navigate("SignIn")}
              >
                <Ionicons name="arrow-back" size={18} color="#64748B" />
                <Text style={styles.backText}> Back to Sign Up</Text>
              </TouchableOpacity>

              <Text style={styles.terms}>
                By signing in, you agree to our{" "}
                <Text style={styles.link}>Terms</Text> and{" "}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = "#F05A14";
const CARD_BG = "#FBF7F4";
const BORDER = "#E6EAF0";
const TEXT = "#0F172A";
const MUTED = "#64748B";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0B0B" },
  container: { flex: 1, justifyContent: "center" },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
    flex: 1,
  },
  closeBtn: { position: "absolute", top: 14, left: 14, zIndex: 10 },
  logoWrap: { alignItems: "center", marginTop: 30, marginBottom: 10 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#F7E7DE",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: { color: ORANGE, fontWeight: "900", fontSize: 18 },
  title: { textAlign: "center", color: TEXT, fontSize: 30, fontWeight: "900" },
  subtitle: {
    textAlign: "center",
    color: MUTED,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 18,
  },
  label: { color: TEXT, fontWeight: "800", fontSize: 14, marginBottom: 8 },
  inputWrap: {
    position: "relative",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: { fontSize: 15, color: TEXT },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: {
    paddingHorizontal: 12,
    color: "#94A3B8",
    fontWeight: "900",
    fontSize: 12,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  googleDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  secondaryText: { color: "#111827", fontWeight: "900", fontSize: 15 },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  backText: { color: MUTED, fontWeight: "700" },
  terms: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 14,
    lineHeight: 16,
  },
  link: { color: "#94A3B8", textDecorationLine: "underline" },
});
