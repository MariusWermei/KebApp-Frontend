import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Erreur", "Email et mot de passe requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (data.result) {
        await AsyncStorage.setItem("token", data.token);
        navigation.replace("OnboardingPreferences");
      } else {
        Alert.alert("Erreur", data.error || "Connexion impossible");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace("Geolocation");
  };

  const handleForgotPassword = () => {
    Alert.alert("Info", "À implémenter : reset password");
  };

  const handleGoogle = () => {
    Alert.alert("Info", "À implémenter : Sign in with Google");
  };

  const handleApple = () => {
    Alert.alert("Info", "À implémenter : Sign in with Apple");
  };

  const goToSignup = () => {
    navigation.navigate("SignUp"); // adapte le nom de ton screen
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.canvas}>
            {/* Card */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.skipWrap} onPress={handleSkip}>
                <Text style={styles.skip}>Skip</Text>
              </TouchableOpacity>

              <View style={styles.iconWrap}>
                <View style={styles.iconBox}>
                  <Ionicons name="rocket-outline" size={26} color="#F05A14" />
                </View>
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Enter your details to access your account
              </Text>

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#9AA4B2"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              {/* Password */}
              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgot}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9AA4B2"
                  secureTextEntry={!showPwd}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPwd((v) => !v)}
                  style={styles.eyeBtn}
                  hitSlop={10}
                >
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9AA4B2"
                  />
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.85 }]}
                onPress={handleSignin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <View style={styles.loginBtnInner}>
                  <Text style={styles.loginText}>
                    {loading ? "Login..." : "Login"}
                  </Text>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={18}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleGoogle}
                >
                  <View style={styles.socialInner}>
                    <Text style={styles.socialIcon}>G</Text>
                    <Text style={styles.socialText}>Google</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleApple}
                >
                  <View style={styles.socialInner}>
                    <Ionicons name="logo-apple" size={18} color="#111827" />
                    <Text style={styles.socialText}>Apple</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Bottom */}
              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>Don't have an account? </Text>
                <TouchableOpacity onPress={goToSignup}>
                  <Text style={styles.bottomLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = "#F05A14";
const BG = "#0B0B0B";
const CARD_BG = "#FBF7F4";
const BORDER = "#E6EAF0";
const TEXT = "#0F172A";
const MUTED = "#64748B";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  canvas: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
    flex: 1,
  },
  skipWrap: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
  },
  skip: {
    color: ORANGE,
    fontWeight: "700",
    fontSize: 16,
  },
  iconWrap: {
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#F7E7DE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    color: TEXT,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    textAlign: "center",
    color: MUTED,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 8,
  },
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
  input: {
    fontSize: 15,
    color: TEXT,
    paddingRight: 34,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 26,
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  forgot: {
    color: ORANGE,
    fontWeight: "700",
    fontSize: 13,
  },
  loginBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  loginBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E6EAF0",
  },
  dividerText: {
    paddingHorizontal: 12,
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  socialBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  socialInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  socialIcon: {
    width: 18,
    textAlign: "center",
    fontWeight: "900",
    color: "#4285F4",
  },
  socialText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  bottomText: {
    color: "#64748B",
    fontWeight: "600",
  },
  bottomLink: {
    color: ORANGE,
    fontWeight: "900",
  },
});
