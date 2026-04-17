import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CartItem as CartItemComponent } from '@/components/shared/CartItem';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    cart,
    cartTotal,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    createOrder,
    loyaltyCard,
    tiers,
    paymentCards,
    selectedPaymentMethod,
  } = useStore();

  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTier = tiers.find((t) => t.name === loyaltyCard?.tier) || tiers[0];
  const tax = cartTotal * 0.09;
  const discount = cartTotal * (currentTier.discountPercentage / 100);
  const pointsDiscount = pointsToRedeem / 100;
  const total = cartTotal + tax - discount - pointsDiscount;
  const pointsEarned = Math.floor(total * currentTier.pointsMultiplier);

  const selectedCard = paymentCards.find((c) => c.id === selectedPaymentMethod);

  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/(tabs)/menu');
    }
  }, [cart]);

  const handleRemoveItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromCart(itemId),
      },
    ]);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (newQuantity === 0) {
      handleRemoveItem(itemId);
    } else {
      updateCartItemQuantity(itemId, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Required', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const order = await createOrder(selectedPaymentMethod, pointsToRedeem);
      Alert.alert(
        'Order Placed! 🎉',
        `Your order #${order.qrCode} has been confirmed. You'll be notified when it's ready.`,
        [
          {
            text: 'View Order',
            onPress: () => {
              router.replace('/(tabs)/orders');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.content}>
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText size="lg" weight="bold">
                  Your Order
                </ThemedText>
                <Pressable onPress={() => clearCart()}>
                  <Text style={[styles.clearText, { color: colors.error }]}>Clear All</Text>
                </Pressable>
              </View>
              {cart.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemoveItem(item.id)}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                />
              ))}
            </View>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <View style={styles.section}>
              <ThemedText size="lg" weight="bold" style={{ marginBottom: 12 }}>
                Payment Method
              </ThemedText>
              {selectedCard && (
                <View style={styles.paymentCard}>
                  <View
                    style={[
                      styles.cardIcon,
                      {
                        backgroundColor:
                          selectedCard.brand === 'visa'
                            ? '#1A1F71'
                            : selectedCard.brand === 'mastercard'
                            ? '#EB001B'
                            : '#006FCF',
                      },
                    ]}
                  >
                    <Ionicons name="card" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardBrand, { color: colors.text }]}>
                      {selectedCard.brand.toUpperCase()} •••• {selectedCard.last4}
                    </Text>
                    <Text style={[styles.cardExpiry, { color: colors.textSecondary }]}>
                      Expires {selectedCard.expiryMonth}/{selectedCard.expiryYear}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
              )}
            </View>
          </Card>

          {loyaltyCard && loyaltyCard.balance > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <View style={styles.section}>
                <ThemedText size="lg" weight="bold" style={{ marginBottom: 12 }}>
                  Redeem Points
                </ThemedText>
                <View style={styles.pointsInfo}>
                  <View style={styles.pointsRow}>
                    <Ionicons name="leaf" size={20} color={colors.primary} />
                    <Text style={[styles.pointsText, { color: colors.text }]}>
                      Available: {loyaltyCard.balance.toLocaleString()} points
                    </Text>
                  </View>
                  <Text style={[styles.pointsValue, { color: colors.textSecondary }]}>
                    = ${(loyaltyCard.balance / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.pointsSlider}>
                  <Pressable
                    onPress={() => setPointsToRedeem(0)}
                    style={[
                      styles.pointsButton,
                      {
                        backgroundColor: pointsToRedeem === 0 ? colors.primary : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pointsButtonText,
                        { color: pointsToRedeem === 0 ? '#ffffff' : colors.text },
                      ]}
                    >
                      None
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPointsToRedeem(Math.min(100, loyaltyCard.balance))}
                    style={[
                      styles.pointsButton,
                      {
                        backgroundColor: pointsToRedeem === 100 ? colors.primary : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pointsButtonText,
                        { color: pointsToRedeem === 100 ? '#ffffff' : colors.text },
                      ]}
                    >
                      100 pts
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setPointsToRedeem(
                        Math.min(Math.floor(total * 100), loyaltyCard.balance)
                      )
                    }
                    style={[
                      styles.pointsButton,
                      {
                        backgroundColor:
                          pointsToRedeem === Math.min(Math.floor(total * 100), loyaltyCard.balance)
                            ? colors.primary
                            : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pointsButtonText,
                        {
                          color:
                            pointsToRedeem ===
                            Math.min(Math.floor(total * 100), loyaltyCard.balance)
                              ? '#ffffff'
                              : colors.text,
                        },
                      ]}
                    >
                      Max
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          )}

          <Card>
            <View style={styles.section}>
              <ThemedText size="lg" weight="bold" style={{ marginBottom: 12 }}>
                Order Summary
              </ThemedText>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${cartTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax (9%)</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${tax.toFixed(2)}
                </Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.success }]}>
                    {currentTier.displayName} Discount ({currentTier.discountPercentage}%)
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>
              )}
              {pointsToRedeem > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.primary }]}>
                    Points Redeemed ({pointsToRedeem} pts)
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    -${pointsDiscount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.pointsEarned, { backgroundColor: colors.secondary }]}>
                <Ionicons name="leaf" size={16} color={colors.primary} />
                <Text style={[styles.pointsEarnedText, { color: colors.primary }]}>
                  You'll earn {pointsEarned} points with this order
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + 16,
            borderTopColor: colors.border,
          },
          Shadows.lg,
        ]}
      >
        <Button
          title={isProcessing ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          variant="primary"
          size="lg"
          fullWidth
          loading={isProcessing}
          icon="checkmark-circle"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardBrand: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 13,
    marginTop: 2,
  },
  pointsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pointsSlider: {
    flexDirection: 'row',
    gap: 10,
  },
  pointsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  pointsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  pointsEarnedText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
});