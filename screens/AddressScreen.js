import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../components/CustomAlert";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressScreen() {
  const navigation = useNavigation();
  const timeoutRef = useRef(null);
  const [detectedAddress, setDetectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    type: "success",
    title: "",
    message: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const [formData, setFormData] = useState({
    label: "",
    housenumber: "",
    street: "",
    postalcode: "",
    city: "",
  });

  const showCustomAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlert(true);
  };

  useEffect(() => {
    loadAddressFromLocation();
    loadSavedAddresses();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const loadAddressFromLocation = async () => {
    try {
      const locationPermissionStatus =
        await AsyncStorage.getItem("locationPermission");
      setLocationPermission(locationPermissionStatus);
      const userLocationJson = await AsyncStorage.getItem("userLocation");
      if (userLocationJson) {
        const coords = JSON.parse(userLocationJson);
        await fetchAddressFromCoordinates(coords);
      }
    } catch (error) {
      // Error silently ignored
    }
  };

  const requestLocationPermission = async () => {
    setLoadingAddress(true);
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      if (result.status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await AsyncStorage.setItem(
          "userLocation",
          JSON.stringify(location.coords),
        );
        await AsyncStorage.setItem("locationPermission", "granted");
        setLocationPermission("granted");
        await fetchAddressFromCoordinates(location.coords);
        showCustomAlert("success", "Succès", "Position détectée!");
      } else {
        await AsyncStorage.setItem("locationPermission", "denied");
        setLocationPermission("denied");
        showCustomAlert(
          "warning",
          "Permission refusée",
          "Active la localisation dans les paramètres.",
        );
      }
    } catch (error) {
      showCustomAlert(
        "error",
        "Erreur",
        "Impossible d'accéder à la localisation.",
      );
    } finally {
      setLoadingAddress(false);
    }
  };

  const fetchAddressFromCoordinates = async (coords) => {
    setLoadingAddress(true);
    try {
      const { latitude, longitude } = coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=28`,
        { headers: { "User-Agent": "KebApp/1.0 (react-native)" } },
      );
      const data = await response.json();

      if (data && data.address) {
        const housenumber = data.address.house_number || "";
        const street = data.address.road || data.address.street || "";
        const postalcode = data.address.postcode || "";
        const city = data.address.city || data.address.town || "";
        const streetPart =
          housenumber && street
            ? `${housenumber} ${street}`
            : street || housenumber;
        const fullAddress = `${streetPart}, ${postalcode} ${city}`.trim();

        setDetectedAddress({
          id: "detected",
          label: "Ma position actuelle",
          address: fullAddress || "Adresse non trouvée",
        });
      }
    } catch (error) {
      // Error silently ignored
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedAddresses");
      if (saved) setSavedAddresses(JSON.parse(saved));
    } catch (error) {
      // Error silently ignored
    }
  };

  const handleAddAddress = async () => {
    const { label, housenumber, street, postalcode, city } = formData;

    if (!label.trim() || !street.trim() || !postalcode.trim() || !city.trim()) {
      showCustomAlert(
        "warning",
        "Information manquante",
        "Complète tous les champs (label, rue, code postal, ville).",
      );
      return;
    }

    setLoading(true);
    try {
      const streetPart =
        housenumber && street ? `${housenumber} ${street}` : street;
      const fullAddress = `${streetPart}, ${postalcode} ${city}`.trim();

      const newAddress = {
        id: Date.now().toString(),
        label: label.trim(),
        address: fullAddress,
      };

      const updated = [...savedAddresses, newAddress];
      await AsyncStorage.setItem("savedAddresses", JSON.stringify(updated));
      setSavedAddresses(updated);
      setFormData({
        label: "",
        housenumber: "",
        street: "",
        postalcode: "",
        city: "",
      });
      setShowAddModal(false);
      showCustomAlert("success", "Succès", "Adresse ajoutée!");
    } catch (error) {
      showCustomAlert("error", "Erreur", "Impossible d'ajouter l'adresse.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id) => {
    setDeleteAddressId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddressId) return;
    try {
      const updated = savedAddresses.filter(
        (addr) => addr.id !== deleteAddressId,
      );
      await AsyncStorage.setItem("savedAddresses", JSON.stringify(updated));
      setSavedAddresses(updated);
      showCustomAlert("success", "Succès", "Adresse supprimée!");
      setShowDeleteConfirm(false);
      setDeleteAddressId(null);
    } catch (error) {
      showCustomAlert("error", "Erreur", "Impossible de supprimer l'adresse.");
      setShowDeleteConfirm(false);
      setDeleteAddressId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "",
      housenumber: "",
      street: "",
      postalcode: "",
      city: "",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adresse</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Ma position actuelle</Text>

        {loadingAddress ? (
          <View style={[styles.card, styles.cardLoading]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.cardLabel}>Récupération de l'adresse...</Text>
          </View>
        ) : detectedAddress ? (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Ionicons
                name="location-outline"
                size={28}
                color={colors.primary}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{detectedAddress.label}</Text>
                <Text style={styles.cardAddress}>
                  {detectedAddress.address}
                </Text>
              </View>
            </View>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.primary}
            />
          </View>
        ) : (
          <View style={styles.noLocationCard}>
            <Ionicons
              name="location-outline"
              size={40}
              color={colors.textLight}
            />
            <Text style={styles.noLocationTitle}>Localisation désactivée</Text>
            <Text style={styles.noLocationMessage}>
              Vous n'avez pas activé la localisation. Veuillez accepter la
              localisation pour afficher votre position ici.
            </Text>
            <TouchableOpacity
              style={styles.enableLocationBtn}
              onPress={requestLocationPermission}
            >
              <Ionicons name="location" size={18} color={colors.textWhite} />
              <Text style={styles.enableLocationBtnText}>
                Activer la localisation
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionLabelSpaced}>Autres adresses</Text>

        {savedAddresses.map((item) => (
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
            <TouchableOpacity
              onPress={() => handleDeleteAddress(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.addBtnText}>Ajouter une adresse</Text>
        </TouchableOpacity>
      </View>

      {/* Modale: Ajouter une adresse */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={styles.backBtn}
              >
                <Ionicons name="arrow-back" size={24} color={colors.textDark} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Nouvelle adresse</Text>
              <View style={styles.spacer} />
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom (Domicile, Bureau...)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Domicile"
                  placeholderTextColor={colors.textLight}
                  value={formData.label}
                  onChangeText={(text) =>
                    setFormData({ ...formData, label: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Numéro de rue</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 10"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  value={formData.housenumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, housenumber: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rue</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Rue de la Paix"
                  placeholderTextColor={colors.textLight}
                  value={formData.street}
                  onChangeText={(text) =>
                    setFormData({ ...formData, street: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Code postal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 75001"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  value={formData.postalcode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, postalcode: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ville</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Paris"
                  placeholderTextColor={colors.textLight}
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleAddAddress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Ajouter l'adresse</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Modale: Confirmation suppression */}
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowDeleteConfirm(false);
          setDeleteAddressId(null);
        }}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons
              name="trash-outline"
              size={40}
              color={colors.error}
              style={styles.confirmIcon}
            />
            <Text style={styles.confirmTitle}>Supprimer l'adresse ?</Text>
            <Text style={styles.confirmMessage}>
              Cette action ne peut pas être annulée.
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteAddressId(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtnConfirm}
                onPress={confirmDeleteAddress}
              >
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        type={alertData.type}
        title={alertData.title}
        message={alertData.message}
        visible={showAlert}
        onClose={() => setShowAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundPage },
  flex: { flex: 1 },
  spacer: { width: 24 },
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
  content: { paddingHorizontal: 24, paddingTop: 16 },
  sectionLabel: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    marginBottom: 16,
  },
  sectionLabelSpaced: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    marginBottom: 16,
    marginTop: 28,
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
  cardLoading: {
    justifyContent: "center",
    gap: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
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
  noLocationCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  noLocationTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
    textAlign: "center",
  },
  noLocationMessage: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  enableLocationBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  enableLocationBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textWhite,
  },
  formGroup: { marginBottom: 20 },
  label: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
    color: colors.textWhite,
  },
  deleteBtn: { padding: 8 },
  confirmBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmIcon: { marginBottom: 4 },
  confirmTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
    textAlign: "center",
  },
  confirmMessage: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonGroup: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textDark,
  },
  deleteBtnConfirm: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.body,
    color: colors.textWhite,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
