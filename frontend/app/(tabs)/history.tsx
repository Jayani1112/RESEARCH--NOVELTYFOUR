import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { ReceiptText, CreditCard, ShoppingBag } from 'lucide-react-native';
import apiClient from '../../api/client';

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

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }: { item: any }) => {
    const date =
      new Date(item.createdAt).toLocaleDateString() +
      ' ' +
      new Date(item.createdAt).toLocaleTimeString();

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View style={styles.iconBox}>
            <ReceiptText color={COLORS.primary} size={22} strokeWidth={1.8} />
          </View>

          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>Order Receipt</Text>
            <Text style={styles.orderDate}>{date}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.orderStatus}>
              {(item.paymentStatus || 'Paid').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.paymentRow}>
          <CreditCard color={COLORS.muted} size={15} />
          <Text style={styles.orderMethod}>
            Payment: {(item.paymentMethod || 'Cash').toUpperCase()}
          </Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((prod: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.productLeft}>
                <ShoppingBag color={COLORS.primary} size={14} />
                <Text style={styles.itemName}>
                  {prod.qty}x {prod.name}
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                RS. {(prod.price * prod.qty).toFixed(2)} (LKR)
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalText}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            RS. {Number(item.total || 0).toFixed(2)} (LKR)
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>{orders.length} previous orders</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ReceiptText color={COLORS.primary} size={46} strokeWidth={1.6} />
            <Text style={styles.emptyText}>No previous orders found</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
    paddingHorizontal: 10,
  },
  header: {
    paddingTop: 34,
    paddingBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  loader: {
    marginTop: 80,
  },
  listContainer: {
    paddingBottom: 110,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 11,
    backgroundColor: COLORS.softRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#EAFBF3',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  orderStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  orderMethod: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  itemsList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 12,
    color: '#A87905',
    fontWeight: '800',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 12,
  },
});