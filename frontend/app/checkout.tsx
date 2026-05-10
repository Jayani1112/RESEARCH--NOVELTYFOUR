import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';

import { useRouter } from 'expo-router';
import apiClient from '../api/client';

import {
  Sparkles,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
} from 'lucide-react-native';

import { useCart } from '../context/CartContext';

const COLORS = {
  bg: '#F7F7F7',
  card: '#FFFFFF',
  primary: '#D7614C',
  text: '#1F2937',
  muted: '#8A8A8A',
  border: '#EEEEEE',
  success: '#22C55E',
  softRed: '#FDECEA',
};

export default function CheckoutScreen() {
  const router = useRouter();

  const {
    cartItems,
    cartTotal,
    addToCart,
    clearCart,
    acceptedRecommendations,
    addAcceptedRecommendation,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);

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
            (r) =>
              r.name.toLowerCase().trim() ===
              rec.name.toLowerCase().trim()
          )
      );

      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('Checkout recommendation error:', error);
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

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);

      await apiClient.post('/orders', {
        items: cartItems,
        total: cartTotal,
        paymentMethod,
        paymentStatus: 'paid',
        acceptedRecommendations,
      });

      Alert.alert('Success', 'Order placed successfully');

      clearCart();

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Place order error:', error);
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQty}>Qty: {item.qty}</Text>
      </View>

      <Text style={styles.itemPrice}>
        RS. {(item.price * item.qty).toFixed(2)} (LKR)
      </Text>
    </View>
  );

  const renderRecommendation = ({ item }: { item: any }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendLeft}>
        <View style={styles.iconBox}>
          <Sparkles color={COLORS.primary} size={20} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.recommendName}>{item.name}</Text>

          <Text style={styles.recommendSub}>
            {item.confidence}% confidence
          </Text>

          <Text style={styles.recommendPrice}>
            RS. {Number(item.price || 0).toFixed(2)} (LKR)
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => handleAddRecommendation(item)}
      >
        <ShoppingCart color="#FFFFFF" size={13} />
        <Text style={styles.addBtnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Checkout</Text>

          <Text style={styles.subtitle}>
            Review order and payment details
          </Text>

          {/* ORDER ITEMS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>

            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.productId}
              renderItem={renderCartItem}
              scrollEnabled={false}
            />
          </View>

          {/* RECOMMENDATIONS */}

          <View style={styles.section}>
            <View style={styles.recommendHeader}>
              <Sparkles color={COLORS.primary} size={20} />

              <Text style={styles.sectionTitle}>
                Smart Recommendations
              </Text>
            </View>

            {loadingRecommendations ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 20 }}
              />
            ) : recommendations.length === 0 ? (
              <Text style={styles.emptyText}>
                No recommendations available
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

          {/* PAYMENT METHODS */}

          <View style={styles.section}>
            <View style={styles.recommendHeader}>
              <CreditCard color={COLORS.primary} size={20} />

              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.paymentRow}>
              {['cash', 'card', 'digital'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentBtn,
                    paymentMethod === method &&
                    styles.paymentBtnActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.paymentBtnText,
                      paymentMethod === method &&
                      styles.paymentBtnTextActive,
                    ]}
                  >
                    {method.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>

            <Text style={styles.totalText}>
              RS. {cartTotal.toFixed(2)} (LKR)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.placeOrderBtn}
            onPress={placeOrder}
            disabled={placingOrder}
          >
            <CheckCircle2 color="#FFFFFF" size={18} />

            <Text style={styles.placeOrderText}>
              {placingOrder ? 'Saving...' : 'Place Order'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 34,
    paddingBottom: 160,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 14,
  },

  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  itemQty: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },

  itemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A87905',
  },

  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  recommendationCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recommendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.softRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  recommendName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  recommendSub: {
    fontSize: 10,
    color: COLORS.success,
    marginTop: 3,
    fontWeight: '700',
  },

  recommendPrice: {
    fontSize: 11,
    color: '#A87905',
    marginTop: 3,
    fontWeight: '800',
  },

  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  paymentBtn: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  paymentBtnActive: {
    backgroundColor: COLORS.softRed,
    borderColor: COLORS.primary,
  },

  paymentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },

  paymentBtnTextActive: {
    color: COLORS.primary,
  },

  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
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

  totalLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
  },

  totalText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 3,
  },

  placeOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});