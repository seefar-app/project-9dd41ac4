import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';
import { Size, Customization } from '@/types';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { menuItems, addToCart } = useStore();

  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Customization[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const item = menuItems.find((m) => m.id === id);

  useEffect(() => {
    if (item && item.sizes.length > 0) {
      setSelectedSize(item.sizes[1] || item.sizes[0]);
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [item]);

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
          <ThemedText size="lg" weight="semibold" style={{ marginTop: 16 }}>
            Product not found
          </ThemedText>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            style={{ marginTop: 20 }}
          />
        </View>
      </ThemedView>
    );
  }

  const toggleCustomization = (customization: Customization) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCustomizations((prev) => {
      const exists = prev.find((c) => c.id === customization.id);
      if (exists) {
        return prev.filter((c) => c.id !== customization.id);
      }
      return [...prev, customization];
    });
  };

  const calculateTotal = () => {
    const sizePrice = selectedSize?.priceModifier || 0;
    const customizationsPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
    return (item.price + sizePrice + customizationsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedSize && item.sizes.length > 0) {
      Alert.alert('Select Size', 'Please select a size for your drink');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(item, selectedSize!, selectedCustomizations, quantity, instructions);
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${item.name} has been added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/cart/checkout') },
      ]
    );
  };

  const groupedCustomizations = selectedCustomizations.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, Customization[]>);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.card }, Shadows.lg]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          {item.category === 'seasonal' && (
            <View style={[styles.seasonalBadge, Shadows.md]}>
              <Ionicons name="sparkles" size={16} color="#F59E0B" />
              <Text style={styles.seasonalText}>Limited Time</Text>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <ThemedText size="2xl" weight="bold">
                {item.name}
              </ThemedText>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
            </View>
            <View style={styles.priceSection}>
              <Text style={[styles.price, { color: colors.primary }]}>
                ${calculateTotal().toFixed(2)}
              </Text>
              <Text style={[styles.basePrice, { color: colors.textTertiary }]}>
                Base: ${item.price.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {item.preparationTime} min
              </Text>
            </View>
            {item.calories && (
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.calories} cal
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="leaf-outline" size={18} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.primary }]}>
                +{Math.floor(calculateTotal())} pts
              </Text>
            </View>
          </View>

          {item.sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Size</Text>
              <View style={styles.sizesGrid}>
                {item.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <Pressable
                      key={size.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedSize(size);
                      }}
                      style={[
                        styles.sizeChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                        Shadows.sm,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeLabel,
                          { color: isSelected ? '#ffffff' : colors.text },
                        ]}
                      >
                        {size.name}
                      </Text>
                      {size.priceModifier > 0 && (
                        <Text
                          style={[
                            styles.sizePrice,
                            { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                          ]}
                        >
                          +${size.priceModifier.toFixed(2)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {item.customizations.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Customizations</Text>
              <View style={styles.customizationsList}>
                {item.customizations.map((customization) => {
                  const isSelected = selectedCustomizations.some((c) => c.id === customization.id);
                  return (
                    <Pressable
                      key={customization.id}
                      onPress={() => toggleCustomization(customization)}
                      style={[
                        styles.customizationItem,
                        {
                          backgroundColor: colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                        Shadows.sm,
                      ]}
                    >
                      <View style={styles.customizationLeft}>
                        <View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: isSelected ? colors.primary : 'transparent',
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                        </View>
                        <Text style={[styles.customizationName, { color: colors.text }]}>
                          {customization.name}
                        </Text>
                      </View>
                      <Text style={[styles.customizationPrice, { color: colors.textSecondary }]}>
                        +${customization.price.toFixed(2)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
            <View style={styles.quantityControl}>
              <Pressable
                onPress={() => {
                  if (quantity > 1) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuantity(quantity - 1);
                  }
                }}
                style={[
                  styles.quantityButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  Shadows.sm,
                ]}
                disabled={quantity === 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity === 1 ? colors.textTertiary : colors.text}
                />
              </Pressable>
              <Text style={[styles.quantityValue, { color: colors.text }]}>{quantity}</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuantity(quantity + 1);
                }}
                style={[
                  styles.quantityButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  Shadows.sm,
                ]}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.card, paddingBottom: insets.bottom + 16, borderTopColor: colors.border },
          Shadows.lg,
        ]}
      >
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.footerPrice, { color: colors.text }]}>
              ${calculateTotal().toFixed(2)}
            </Text>
          </View>
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            variant="primary"
            icon="cart"
            disabled={!item.available}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonalBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seasonalText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 12,
  },
  basePrice: {
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sizesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  sizeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  sizePrice: {
    fontSize: 12,
    marginTop: 4,
  },
  customizationsList: {
    gap: 10,
  },
  customizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  customizationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customizationName: {
    fontSize: 15,
    fontWeight: '500',
  },
  customizationPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 32,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
});