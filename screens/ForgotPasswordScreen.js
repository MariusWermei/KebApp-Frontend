import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    setStatus("loading");

    if (!email.trim()) {
      setError("Email requis");
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (data.result) {
        setStatus("sent");
      } else {
        setStatus("idle");
        setError(data.error || "Erreur serveur");
      }
    } catch (e) {
      setStatus("idle");
      setError("Erreur réseau");
    }
  };

  if (status === "sent") {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.sentContainer}>
          <View style={styles.card}>
            <Ionicons name="mail-outline" size={40} color={colors.primary} />
            <Text style={styles.title}>Email envoyé</Text>
            <Text style={styles.subtitle}>
              Si un compte existe pour{" "}
              <Text style={styles.emailBold}>{email}</Text>, tu vas recevoir un
              lien de réinitialisation (valable 1h).
            </Text>

            <TouchableOpacity
              style={styles.buttonSpaced}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Réinitialiser le mot de passe</Text>
          <Text style={styles.subtitle}>
            On t'envoie un lien par email pour choisir un nouveau mot de passe.
          </Text>

          <TextInput
            placeholder="Ton email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textLight}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSend}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Envoyer le lien</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPage,
  },
  backButton: {
    paddingLeft: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    textAlign: "center",
    color: colors.textGray,
    lineHeight: 20,
    marginBottom: 18,
  },
  emailBold: {
    fontFamily: fonts.family.bold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inactive,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.backgroundLight,
    marginBottom: 10,
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  buttonSpaced: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
    width: "100%",
  },
  buttonText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textWhite,
  },
  error: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.error,
    marginBottom: 10,
    textAlign: "center",
  },
});
