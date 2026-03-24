import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResetPasswordScreen({ route, navigation }) {
  const token = route?.params?.token;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={colors.error}
          />
          <Text style={styles.title}>Lien invalide ❌</Text>
          <Text style={styles.subtitle}>
            Token manquant. Assure-toi d'avoir cliqué le lien depuis l'email.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.buttonText}>Retour au formulaire</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (success) {
    return (
      <SafeAreaView style={styles.containerLight}>
        <View style={styles.successBox}>
          <View style={styles.successCircle}>
            <Ionicons
              name="checkmark-outline"
              size={80}
              color={colors.primary}
            />
          </View>
          <Text style={styles.successTitle}>Mot de passe modifié ✅</Text>
          <Text style={styles.successSubtitle}>
            Ton mot de passe a été changé avec succès. Tu es redirigé vers
            l'accueil...
          </Text>
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleReset = async () => {
    if (!password.trim() || !confirm.trim()) {
      Alert.alert("Erreur", "Tous les champs sont requis");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit faire au moins 8 caractères.",
      );
      return;
    }

    if (password !== confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (data.result) {
        setSuccess(true);
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        }, 2000);
      } else {
        Alert.alert(
          "Erreur",
          data.error || "Impossible de changer le mot de passe",
        );
      }
    } catch (error) {
      Alert.alert("Erreur réseau", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons
              name="lock-closed-outline"
              size={50}
              color={colors.primary}
              style={styles.iconSpacing}
            />
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Crée un mot de passe sécurisé pour accéder à ton compte
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPwd}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPwd(!showPwd)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                  editable={!loading}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.textWhite}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Changer le mot de passe</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.note}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.noteText}>
              Utilise un mot de passe fort (min. 8 caractères)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  containerLight: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  flex: { flex: 1 },
  backButton: {
    paddingLeft: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "flex-start",
  },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryPale,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: fonts.size.h3,
    fontFamily: fonts.family.bold,
    color: colors.textDark,
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  loader: { marginTop: 24 },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconSpacing: { marginBottom: 12 },
  title: {
    fontSize: fonts.size.h3,
    fontFamily: fonts.family.bold,
    color: colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.semibold,
    color: colors.textDark,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCream,
    borderWidth: 1,
    borderColor: colors.progressBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  eyeBtn: { padding: 8 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonIcon: { marginRight: 8 },
  buttonText: {
    fontSize: fonts.size.body,
    fontFamily: fonts.family.bold,
    color: colors.textWhite,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBg,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: fonts.size.small,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
  },
});
