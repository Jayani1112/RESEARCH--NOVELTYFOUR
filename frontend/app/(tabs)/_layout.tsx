import { Tabs } from 'expo-router';
import { useCart } from '../../context/CartContext';
import {
  ShoppingCart,
  Package,
  ReceiptText,
  BarChart3,
} from 'lucide-react-native';

const COLORS = {
  primary: '#D7614C',
  inactive: '#9CA3AF',
  background: '#FFFFFF',
  border: '#EEEEEE',
};

export default function TabLayout() {
  const { cartItems } = useCart();

  const cartItemCount = cartItems.reduce(
    (total: number, item: { qty: number }) => total + item.qty,
    0
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          elevation: 10,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 30,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primary,
            color: '#FFFFFF',
          },
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <ReceiptText color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}