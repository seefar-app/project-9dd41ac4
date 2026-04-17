import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { MenuItemCard } from '@/components/shared/MenuItemCard';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';
import { MenuCategory } from '@/types';

const CATEGORIES: { id: MenuCategory | null; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: null, label: 'All', icon: 'grid-outline' },
  { id: 'coffee', label: 'Coffee', icon: 'cafe-outline' },
  { id: 'tea', label: 'Tea', icon: 'leaf-outline' },
  { id: 'pastries', label: 'Pastries', icon: 'restaurant-outline' },
  { id: 'sandwiches', label: 'Food', icon: 'fast-food-outline' },
  { id: 'smoothies', label: 'Smoothies', icon: 'nutrition-outline' },
  { id: 'seasonal', label: 'Seasonal', icon: 'sparkles-outline' },
];

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    menuItems,
    menuLoading,
    selectedCategory,
    setSelectedCategory,
    fetchMenuItems,
    cart,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (menuItems.length === 0) {
      fetchMenuItems();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  };

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View>
            <ThemedText size="2xl" weight="bold">Menu</ThemedText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {filteredItems.length} items available
            </Text>
          </View>
          {cartCount > 0 && (
            <Pressable
              onPress={() => router.push('/cart/checkout')}
              style={[styles.cartButton, { backgroundColor: colors.primary }, Shadows.md]}
            >
              <Ionicons name="cart" size={22} color="#ffffff" />
              <View style={[styles.cartBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id || 'all'}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                  !isSelected && Shadows.sm,
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isSelected ? '#ffffff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isSelected ? '#ffffff' : colors.text },
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {menuLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cafe-outline" size={64} color={colors.textTertiary} />
              <ThemedText size="lg" weight="semibold" style={{ marginTop: 16 }}>
                No items found
              </ThemedText>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Try selecting a different category
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/product/${item.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
});