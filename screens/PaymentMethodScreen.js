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

const FAKE_CARDS = [
  { id: "1", type: "Visa", last4: "4242", expiry: "12/26" },
  { id: "2", type: "Mastercard", last4: "8888", expiry: "08/25" },
];

export default function PaymentMethodScreen() {
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
        <Text style={styles.headerTitle}>Méthode de paiement</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Vos méthodes de paiement</Text>

        {FAKE_CARDS.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Ionicons name="card-outline" size={28} color={colors.primary} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardType}>
                  {card.type} •••• {card.last4}
                </Text>
                <Text style={styles.cardExpiry}>Expire le {card.expiry}</Text>
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
          <Text style={styles.addBtnText}>Ajouter une carte</Text>
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
  },
  cardInfo: { gap: 2 },
  cardType: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  cardExpiry: {
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
