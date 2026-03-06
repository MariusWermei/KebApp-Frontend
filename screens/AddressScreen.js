import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors";
import fonts from "../constants/fonts";

const FAKE_ADDRESSES = [
  { id: "1", label: "Domicile", address: "12 rue de la Paix, 75001 Paris" },
  {
    id: "2",
    label: "Bureau",
    address: "45 avenue des Champs-Élysées, 75008 Paris",
  },
];

export default function AddressScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adresse</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Vos adresses enregistrées</Text>

        {FAKE_ADDRESSES.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Ionicons
                name="location-outline"
                size={28}
                color={colors.primary}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardAddress}>{item.address}</Text>
              </View>
            </View>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.primary}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn}>
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.addBtnText}>Ajouter une adresse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionLabel: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardLabel: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  cardAddress: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textMuted,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  addBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.primary,
  },
});
