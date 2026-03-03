import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { logout } from "../reducers/user";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Si l'utilisateur n'est pas connecté
  if (!token) {
    return (
      <View style={styles.container}>
        <Ionicons name="person-circle-outline" size={80} color={colors.textLight} />
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.subtitle}>
          Connecte-toi pour accéder à ton profil et tes commandes.
        </Text>

        <Button
          title="Se connecter"
          onPress={() => navigation.navigate("SignIn", { fromOnboarding: false })}
        />

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate("SignUp", { fromOnboarding: false })}
        >
          <Text style={styles.signupText}>
            Pas de compte ? <Text style={styles.signupBold}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si l'utilisateur est connecté
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle" size={80} color={colors.primary} />
      <Text style={styles.title}>Mon Profil</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.primary} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  signupLink: {
    marginTop: 18,
  },
  signupText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  signupBold: {
    fontFamily: fonts.family.bold,
    color: colors.primary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  logoutText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.primary,
  },
});
