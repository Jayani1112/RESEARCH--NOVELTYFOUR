import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout', presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </CartProvider>
  );
}
