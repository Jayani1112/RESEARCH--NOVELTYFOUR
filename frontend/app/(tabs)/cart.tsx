import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'expo-router';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ShoppingCart,
} from 'lucide-react-native';
import apiClient from '../../api/client';

const COLORS = {
  bg: '#F7F7F7',
  card: '#FFFFFF',
  primary: '#D7614C',
  text: '#1F2937',
  muted: '#8A8A8A',
  border: '#EEEEEE',
  softRed: '#FDECEA',
  success: '#22C55E',
};

export default function CartScreen() {
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    cartTotal,
    addToCart,
    addAcceptedRecommendation,
  } = useCart();

  const router = useRouter();

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [cartItems]);

  const fetchRecommendations = async () => {
    if (cartItems.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoadingRecommendations(true);

    try {
      const responses = await Promise.all(
        cartItems.map((item: any) =>
          apiClient.get('/recommendations/csv', {
            params: {
              product: item.name,
            },
          })
        )
      );

      const allRecommendations = responses.flatMap(
        (response) => response.data.recommendations || []
      );

      const cartNames = cartItems.map((item: any) =>
        item.name.toLowerCase().trim()
      );

      const uniqueRecommendations = allRecommendations.filter(
        (rec: any, index: number, self: any[]) =>
          !cartNames.includes(rec.name.toLowerCase().trim()) &&
          index ===
          self.findIndex(
            (r) => r.name.toLowerCase().trim() === rec.name.toLowerCase().trim()
          )
      );

      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('Cart recommendation error:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddRecommendation = (item: any) => {
    addToCart({
      _id: item.productId || item.name,
      name: item.name,
      price: Number(item.price || 0),
    });

    addAcceptedRecommendation(item.productId || item.name);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <View style={styles.iconBox}>
        <ShoppingBag color={COLORS.primary} size={22} />
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>RS. {Number(item.price).toFixed(2)} (LKR)</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decreaseQty(item.productId)}>
            <Minus color={COLORS.text} size={14} />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.qty}</Text>

          <TouchableOpacity style={styles.qtyBtn} onPress={() => increaseQty(item.productId)}>
            <Plus color={COLORS.text} size={14} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.productId)}>
          <Trash2 color="#FFFFFF" size={13} />
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecommendation = ({ item }: { item: any }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendLeft}>
        <View style={styles.recommendIconBox}>
          <Sparkles color={COLORS.primary} size={20} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.recommendName}>{item.name}</Text>
          <Text style={styles.recommendSub}>
            {item.confidence}% confidence · {item.pairCount} pairs
          </Text>
          <Text style={styles.recommendPrice}>
            RS. {Number(item.price || 0).toFixed(2)} (LKR)
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addRecommendBtn}
        onPress={() => handleAddRecommendation(item)}
      >
        <ShoppingCart color="#FFFFFF" size={13} />
        <Text style={styles.addRecommendText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Cart</Text>
            <Text style={styles.subtitle}>{cartItems.length} items selected</Text>
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingBag color={COLORS.primary} size={46} />
              <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.productId}
                renderItem={renderCartItem}
                scrollEnabled={false}
              />

              <View style={styles.recommendSection}>
                <View style={styles.sectionTitleRow}>
                  <Sparkles color={COLORS.primary} size={20} />
                  <Text style={styles.sectionTitle}>Smart Recommendations</Text>
                </View>

                {loadingRecommendations ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : recommendations.length === 0 ? (
                  <Text style={styles.noRecommendation}>
                    No recommendations found for selected products.
                  </Text>
                ) : (
                  <FlatList
                    data={recommendations}
                    keyExtractor={(item, index) => item.name + index}
                    renderItem={renderRecommendation}
                    scrollEnabled={false}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>

        {cartItems.length > 0 && (
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalText}>RS. {cartTotal.toFixed(2)} (LKR)</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
              <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 10, paddingBottom: 180 },
  header: { paddingTop: 34, paddingBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  cartItem: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 11,
    backgroundColor: COLORS.softRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemPrice: { fontSize: 12, color: '#A87905', fontWeight: '700', marginTop: 5 },
  rightSection: { alignItems: 'flex-end' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  qtyBtn: {
    width: 27,
    height: 27,
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { marginHorizontal: 9, fontSize: 14, fontWeight: '700', color: COLORS.text },
  removeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  recommendSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  recommendationCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recommendIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.softRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recommendName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  recommendSub: { fontSize: 10, color: COLORS.success, marginTop: 3, fontWeight: '700' },
  recommendPrice: { fontSize: 11, color: '#A87905', marginTop: 3, fontWeight: '800' },
  addRecommendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addRecommendText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  noRecommendation: { color: COLORS.muted, fontSize: 12 },
  footer: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 105,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  totalText: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 3 },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 13,
  },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  emptyContainer: { marginTop: 160, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: COLORS.text, fontWeight: '800', marginTop: 12 },
});