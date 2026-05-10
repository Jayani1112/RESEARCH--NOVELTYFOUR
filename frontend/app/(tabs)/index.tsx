import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  Package,
  Coffee,
  Sandwich,
  Cookie,
  ShoppingCart,
  Search,
  CakeSlice,
  Croissant,
  CupSoda,
  Pizza,
  Soup,
  IceCreamBowl,
  Salad,
} from 'lucide-react-native';

import { useCart } from '../../context/CartContext';
import apiClient from '../../api/client';

const COLORS = {
  bg: '#F7F7F7',
  card: '#FFFFFF',
  primary: '#D7614C',
  text: '#1F2937',
  muted: '#8A8A8A',
  border: '#EEEEEE',
  success: '#22C55E',
  warning: '#EAB308',
  softRed: '#FDECEA',
  softGreen: '#EAFBF3',
};

const categories = ['All', 'Bakery', 'Beverage', 'Food'];

export default function ProductsScreen() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const detectCategory = (name: string, backendCategory?: string) => {
    const productName = name?.toLowerCase() || '';
    const category = backendCategory?.toLowerCase()?.trim();

    if (category === 'bakery') return 'Bakery';
    if (category === 'beverage') return 'Beverage';
    if (category === 'food') return 'Food';

    if (
      productName.includes('bread') ||
      productName.includes('cake') ||
      productName.includes('cookie') ||
      productName.includes('muffin') ||
      productName.includes('bun')
    ) {
      return 'Bakery';
    }

    if (
      productName.includes('coffee') ||
      productName.includes('tea') ||
      productName.includes('juice') ||
      productName.includes('drink') ||
      productName.includes('milkshake')
    ) {
      return 'Beverage';
    }

    return 'Food';
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');

      const formattedProducts = response.data.map((item: any) => {
        const productName =
          item.name ||
          item.product_name ||
          item.selected_product ||
          item.product ||
          'Unknown Product';

        return {
          _id: item._id || item.id || productName,
          name: productName,
          category: detectCategory(productName, item.category),
          price: Number(item.price || item.unit_price || item.selling_price || 0),
          stock: Number(item.stock || item.quantity || item.qty || 0),
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchSearch = item.name
        ?.toLowerCase()
        .includes(searchText.toLowerCase().trim());

      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchText]);

  const getIconColor = (category: string) => {
    if (category === 'Beverage') return '#14B8A6';
    if (category === 'Food') return '#22C55E';
    return COLORS.primary;
  };

  const getIconBoxColor = (category: string) => {
    if (category === 'Beverage' || category === 'Food') return COLORS.softGreen;
    return COLORS.softRed;
  };

  const getIcon = (name: string, category: string) => {
    const color = getIconColor(category);
    const size = 22;
    const productName = name?.toLowerCase() || '';

    if (productName.includes('bread')) {
      return <Croissant color={color} size={size} strokeWidth={1.8} />;
    }

    if (productName.includes('cake')) {
      return <CakeSlice color={color} size={size} strokeWidth={1.8} />;
    }

    if (productName.includes('coffee') || productName.includes('tea')) {
      return <Coffee color={color} size={size} strokeWidth={1.8} />;
    }

    if (productName.includes('cookie')) {
      return <Cookie color={color} size={size} strokeWidth={1.8} />;
    }

    if (
      productName.includes('juice') ||
      productName.includes('milkshake') ||
      productName.includes('drink') ||
      productName.includes('orange')
    ) {
      return <CupSoda color={color} size={size} strokeWidth={1.8} />;
    }

    if (
      productName.includes('sandwich') ||
      productName.includes('burger') ||
      productName.includes('bun')
    ) {
      return <Sandwich color={color} size={size} strokeWidth={1.8} />;
    }

    if (productName.includes('salad')) {
      return <Salad color={color} size={size} strokeWidth={1.8} />;
    }

    if (productName.includes('pizza')) {
      return <Pizza color={color} size={size} strokeWidth={1.8} />;
    }

    if (
      productName.includes('soup') ||
      productName.includes('rice') ||
      productName.includes('noodle')
    ) {
      return <Soup color={color} size={size} strokeWidth={1.8} />;
    }

    if (
      productName.includes('ice') ||
      productName.includes('cream') ||
      productName.includes('dessert')
    ) {
      return <IceCreamBowl color={color} size={size} strokeWidth={1.8} />;
    }

    return <Package color={color} size={size} strokeWidth={1.8} />;
  };

  const renderProduct = ({ item }: { item: any }) => {
    const stockColor = item.stock < 100 ? COLORS.warning : COLORS.success;

    return (
      <View style={styles.productCard}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: getIconBoxColor(item.category) },
            ]}
          >
            {getIcon(item.name, item.category)}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={[styles.category, { color: getIconColor(item.category) }]}>
              {item.category}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.price}>RS. {item.price} (LKR)</Text>

          <View style={styles.stockBarBg}>
            <View
              style={[
                styles.stockBar,
                {
                  width: `${Math.min(item.stock / 20, 100)}%`,
                  backgroundColor: stockColor,
                },
              ]}
            />
          </View>

          <Text style={[styles.stockText, { color: stockColor }]}>
            {item.stock} left
          </Text>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(item)}
            activeOpacity={0.85}
          >
            <ShoppingCart color="#FFFFFF" size={13} strokeWidth={2.2} />
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </TouchableOpacity>
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
          style={{ marginTop: 80 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>
              {filteredProducts.length} items found
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search color={COLORS.primary} size={20} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.activeCategoryChipText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found</Text>
          }
        />
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
    paddingBottom: 12,
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
  searchBox: {
    height: 46,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.softRed,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    minHeight: 104,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A87905',
  },
  stockBarBg: {
    width: 70,
    height: 4,
    backgroundColor: '#F1F1F1',
    borderRadius: 5,
    marginTop: 6,
    overflow: 'hidden',
  },
  stockBar: {
    height: '100%',
    borderRadius: 5,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },
  addBtn: {
    marginTop: 7,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.muted,
    fontSize: 14,
  },
});