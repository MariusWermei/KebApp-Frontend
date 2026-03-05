import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  Linking,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, clearCart } from "../reducers/cart";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import Button from "../components/Button";

export default function RestaurantScreen({ route, navigation }) {
  const { restaurantName } = route.params;
  const [hoursVisible, setHoursVisible] = useState(false);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // plat sélectionné pour la modal
  const [selectedOptions, setSelectedOptions] = useState({}); // options choisies
  const [modalVisible, setModalVisible] = useState(false);

  const token = useSelector((state) => state.user.token);
  const cartRestaurantName = useSelector((state) => state.cart.restaurantName);
  const dispatch = useDispatch();
  const handleClearCart = () => dispatch(clearCart());
  const cartItems = useSelector((state) => state.cart.items);
  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.menuItem.basePrice * i.quantity,
    0,
  );
  const Api_Url = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    // Vide le panier si on change de restaurant
    if (cartRestaurantName && cartRestaurantName !== restaurantName) {
      dispatch(clearCart());
    }

    fetch(`${Api_Url}/restaurants/${encodeURIComponent(restaurantName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setRestaurant(data.restaurant);
          const firstCategory = data.restaurant.menu[0]?.category;

          setActiveCategory(firstCategory);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setSelectedOptions({});
    setModalVisible(true);
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🥙 ${restaurant.name}\n📍 ${restaurant.address}\n⭐ ${restaurant.rating}/5\n\nDécouvre ce restaurant sur KebApp !`,
      });
    } catch (error) {
      console.log(error);
    }
  };
  const toggleOption = (label, option, multiple = true) => {
    setSelectedOptions((prev) => {
      const current = prev[label] || [];
      if (multiple) {
        return {
          ...prev,
          [label]: current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option],
        };
      } else {
        return { ...prev, [label]: [option] };
      }
    });
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        menuItem: selectedItem,
        selectedOptions,
        restaurantName,
      }),
    );
    setModalVisible(false);
  };
  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={colors.primary}
      />
    );
  if (!restaurant) return <Text>Restaurant non trouvé</Text>;
  const isOpenNow = restaurant.isOpenNow;
  const categories = [...new Set(restaurant.menu.map((item) => item.category))];
  const filteredMenu = restaurant.menu.filter(
    (item) => item.category === activeCategory,
  );

  // Affiche le formulaire de connexion si pas de token
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.textLight} />
          <Text style={styles.lockedTitle}>Contenu réservé aux membres</Text>
          <Text style={styles.lockedSubtitle}>
            Connectez-vous pour voir les infos et les menus de ce restaurant
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.signInBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Affiche le restaurant et le menu
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Photo de couverture */}
        {restaurant.photos?.[0] ? (
          <Image
            source={{ uri: restaurant.photos[0] }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        {/* Bouton retour */}
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="heart-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Infos restaurant */}
        <View style={styles.infoCard}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`,
              )
            }
          >
            <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
              📍 {restaurant.address}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#E8572A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}
          >
            <Text style={styles.phone}>📞 {restaurant.phone}</Text>
            <Ionicons name="chevron-forward" size={16} color="#E8572A" />
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <TouchableOpacity
              style={styles.infoHalf}
              onPress={() => setReviewsVisible(true)}
            >
              {/* Affiche la note et le nombre d'avis, ouvre la modal des avis au clic */}
              <View style={styles.reviewsBtnLeft}>
                <Ionicons name="star" size={16} color={colors.primary} />
                <Text style={styles.reviewsBtnText}>
                  {restaurant.rating} · {restaurant.totalRatings}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            {/*Affiche les horaires d'ouverture dans une modal*/}
            <TouchableOpacity
              style={styles.infoHalf}
              onPress={() => setHoursVisible(true)}
            >
              <View style={styles.reviewsBtnLeft}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isOpenNow ? "#22C55E" : "#EF4444"}
                />
                <Text
                  style={[
                    styles.reviewsBtnText,
                    { color: isOpenNow ? "#22C55E" : "#EF4444" },
                  ]}
                >
                  {isOpenNow ? "Ouvert" : "Fermé"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtres catégories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterBtn,
                activeCategory === cat && styles.filterBtnActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeCategory === cat && styles.filterTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Liste des plats */}
        {filteredMenu.map((item) => (
          <View key={item._id} style={styles.menuCard}>
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDesc}>{item.description}</Text>
              <Text style={styles.menuPrice}>
                {(item.basePrice / 100).toFixed(2)}€
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => openModal(item)}
            >
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bouton panier */}
      <TouchableOpacity
        style={styles.cartBar}
        onPress={() => navigation.navigate("Cart")}
      >
        <View style={styles.cartCount}>
          <Text style={styles.cartCountText}>{totalCount}</Text>
        </View>
        <Text style={styles.cartBarText}>Panier</Text>
        <Text style={styles.cartBarPrice}>
          {(totalPrice / 100).toFixed(2)}€
        </Text>
      </TouchableOpacity>
      {/* Bouton DEV reset panier */}
      {totalCount > 0 && (
        <TouchableOpacity style={styles.devBtn} onPress={handleClearCart}>
          <Text style={styles.devBtnText}>🗑️ DEV — Vider le panier</Text>
        </TouchableOpacity>
      )}
      {/* Modal des horaires */}
      <Modal visible={hoursVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Horaires</Text>
              <View
                style={[
                  styles.openBadge,
                  { backgroundColor: isOpenNow ? "#DCFCE7" : "#FEE2E2" },
                ]}
              >
                <Text
                  style={[
                    styles.openBadgeText,
                    { color: isOpenNow ? "#22C55E" : "#EF4444" },
                  ]}
                >
                  {isOpenNow ? "Ouvert maintenant" : "Fermé actuellement"}
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {restaurant.openingHours?.length > 0 ? (
                restaurant.openingHours.map((line, index) => {
                  const [day, hours] = line.split(": ");
                  return (
                    <View key={index} style={styles.hoursRow}>
                      <Text style={styles.hoursDay}>{day}</Text>
                      <Text style={styles.hoursText}>{hours || line}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.hoursEmpty}>Horaires non disponibles</Text>
              )}
            </ScrollView>

            <Button title="Fermer" onPress={() => setHoursVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal des avis */}
      <Modal visible={reviewsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Avis</Text>
              <View style={styles.reviewsRating}>
                <Ionicons name="star" size={20} color={colors.primary} />
                <Text style={styles.reviewsRatingText}>
                  {restaurant.rating}
                </Text>
                <Text style={styles.reviewsTotal}>
                  ({restaurant.totalRatings})
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {restaurant.reviews?.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  {/* Auteur */}
                  <View style={styles.reviewAuthor}>
                    {review.profilePhoto ? (
                      <Image
                        source={{ uri: review.profilePhoto }}
                        style={styles.reviewAvatar}
                      />
                    ) : (
                      <View style={styles.reviewAvatarPlaceholder}>
                        <Text style={styles.reviewAvatarLetter}>
                          {review.author?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.reviewAuthorName}>
                        {review.author}
                      </Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>

                  {/* Étoiles */}
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={14}
                        color={colors.primary}
                      />
                    ))}
                  </View>

                  {/* Commentaire */}
                  <Text style={styles.reviewText}>{review.text}</Text>
                </View>
              ))}
            </ScrollView>

            <Button title="Fermer" onPress={() => setReviewsVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal configuration plat */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.modalPrice}>
              {((selectedItem?.basePrice || 0) / 100).toFixed(2)}€
            </Text>

            <ScrollView>
              {/* Sauces */}
              {selectedItem?.sauces?.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={styles.optionLabel}>Sauce</Text>
                  {selectedItem.sauces.map((sauce) => (
                    <TouchableOpacity
                      key={sauce.name}
                      style={[
                        styles.optionBtn,
                        selectedOptions["sauce"]?.includes(sauce.name) &&
                          styles.optionBtnActive,
                      ]}
                      onPress={() => toggleOption("sauce", sauce.name, true)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedOptions["sauce"]?.includes(sauce.name) &&
                            styles.optionTextActive,
                        ]}
                      >
                        {sauce.name}{" "}
                        {sauce.extraPrice > 0
                          ? `+${sauce.extraPrice / 100}€`
                          : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Customizations (garniture, pain, viandes...) */}
              {selectedItem?.customizations?.map((custom) => (
                <View key={custom.label} style={styles.optionSection}>
                  <Text style={styles.optionLabel}>{custom.label}</Text>
                  {custom.options.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionBtn,
                        selectedOptions[custom.label]?.includes(option) &&
                          styles.optionBtnActive,
                      ]}
                      onPress={() =>
                        toggleOption(
                          custom.label,
                          option,
                          custom.label === "Garniture", // true = multiple, false = unique
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedOptions[custom.label]?.includes(option) &&
                            styles.optionTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Suppléments */}
              {selectedItem?.supplements?.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={styles.optionLabel}>Suppléments</Text>
                  {selectedItem.supplements.map((sup) => (
                    <TouchableOpacity
                      key={sup.name}
                      style={[
                        styles.optionBtn,
                        selectedOptions["supplements"]?.includes(sup.name) &&
                          styles.optionBtnActive,
                      ]}
                      onPress={() =>
                        toggleOption("supplements", sup.name, true)
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedOptions["supplements"]?.includes(sup.name) &&
                            styles.optionTextActive,
                        ]}
                      >
                        {sup.name} +{(sup.price / 100).toFixed(2)}€
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Boutons modal */}

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartText}>Ajouter au panier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  coverImage: { width: "100%", height: 220, resizeMode: "cover" },
  coverPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: colors.border,
  },
  headerButtons: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: { flexDirection: "row", gap: 5 },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1.5,
    borderColor: colors.textWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: { padding: 16 },
  name: { fontSize: 24, fontFamily: fonts.family.bold, marginBottom: 8 },
  address: {
    fontSize: 14,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
  },
  phone: {
    fontSize: 14,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
  },
  filters: { paddingHorizontal: 16, marginVertical: 12 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontFamily: fonts.family.semibold, color: colors.textMuted },
  filterTextActive: { color: colors.textWhite },
  menuCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.backgroundCream,
  },
  linkBtn: {
    backgroundColor: colors.border,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuInfo: { flex: 1, marginRight: 12 },
  menuName: { fontSize: 16, fontFamily: fonts.family.semibold },
  menuDesc: {
    fontSize: 12,
    fontFamily: fonts.family.regular,
    color: colors.textLight,
    marginVertical: 4,
  },
  menuPrice: {
    fontSize: 14,
    fontFamily: fonts.family.bold,
    color: colors.primary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: colors.textWhite,
    fontSize: 20,
    fontFamily: fonts.family.semibold,
  },
  cartBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  cartCount: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cartCountText: {
    color: colors.primary,
    fontFamily: fonts.family.bold,
    fontSize: 12,
  },
  cartBarText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  cartBarPrice: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 20, fontFamily: fonts.family.bold, marginBottom: 4 },
  modalPrice: {
    fontSize: 16,
    fontFamily: fonts.family.semibold,
    color: colors.primary,
    marginBottom: 16,
  },
  optionSection: { marginBottom: 16 },
  optionLabel: {
    fontSize: 14,
    fontFamily: fonts.family.semibold,
    marginBottom: 8,
    color: colors.textDark,
  },
  optionBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  optionBtnActive: { backgroundColor: colors.primary },
  optionText: { fontFamily: fonts.family.regular, color: colors.textDark },
  optionTextActive: {
    color: colors.textWhite,
    fontFamily: fonts.family.semibold,
  },
  addToCartBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addToCartText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  cancelBtn: { padding: 12, alignItems: "center" },
  cancelText: { color: colors.textLight, fontFamily: fonts.family.regular },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockedTitle: {
    fontSize: 20,
    fontFamily: fonts.family.bold,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  lockedSubtitle: {
    fontSize: 14,
    fontFamily: fonts.family.regular,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  signInBtnText: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: 16,
  },
  backBtn: {
    position: "absolute",
    top: 36,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewsBtn: {
    backgroundColor: colors.backgroundCream,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewsBtnLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewsBtnText: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.small,
    color: colors.primary,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewsTitle: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h3,
    color: colors.textDark,
  },
  reviewsRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewsRatingText: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.h4,
    color: colors.textDark,
  },
  reviewsTotal: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
  },
  reviewCard: {
    backgroundColor: colors.backgroundCream,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reviewAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarLetter: {
    color: colors.textWhite,
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.body,
  },
  reviewAuthorName: {
    fontFamily: fonts.family.semibold,
    fontSize: fonts.size.small,
    color: colors.textDark,
  },
  reviewDate: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.caption,
    color: colors.textMuted,
  },
  reviewStars: { flexDirection: "row", gap: 2, marginBottom: 6 },
  reviewText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  infoHalf: {
    flex: 1,
    backgroundColor: colors.backgroundCream,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
