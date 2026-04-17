import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { Shadows } from '@/constants/Colors';
import { format } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const { colors } = useTheme();

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'primary';
      case 'ready':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isActive = ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card },
        Shadows.sm,
        isActive && styles.activeCard,
        isActive && { borderColor: colors.primary },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            #{order.qrCode}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {format(order.createdAt, 'MMM d, yyyy • h:mm a')}
          </Text>
        </View>
        <Badge
          label={getStatusLabel(order.status)}
          variant={getStatusVariant(order.status) as any}
          size="sm"
        />
      </View>

      <View style={styles.items}>
        {order.items.slice(0, 3).map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              contentFit="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.itemDetails, { color: colors.textTertiary }]}>
                {item.size !== '-' ? `${item.size} • ` : ''}Qty: {item.quantity}
              </Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text style={[styles.moreItems, { color: colors.textTertiary }]}>
            +{order.items.length - 3} more items
          </Text>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.total}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
        {order.pointsEarned > 0 && (
          <View style={[styles.pointsEarned, { backgroundColor: colors.secondary }]}>
            <Ionicons name="leaf" size={14} color={colors.primary} />
            <Text style={[styles.pointsText, { color: colors.primary }]}>
              +{order.pointsEarned} pts
            </Text>
          </View>
        )}
      </View>

      {isActive && (
        <View style={[styles.progressSection, { borderTopColor: colors.border }]}>
          <View style={styles.progressSteps}>
            {['confirmed', 'preparing', 'ready'].map((step, index) => {
              const stepIndex = ['confirmed', 'preparing', 'ready'].indexOf(order.status);
              const isCompleted = index <= stepIndex;
              const isCurrent = step === order.status;
              
              return (
                <View key={step} style={styles.step}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: isCompleted ? colors.primary : colors.border,
                        borderColor: isCurrent ? colors.primary : 'transparent',
                        borderWidth: isCurrent ? 3 : 0,
                      },
                    ]}
                  />
                  {index < 2 && (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: index < stepIndex ? colors.primary : colors.border },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          {order.status === 'ready' && (
            <Text style={[styles.readyText, { color: colors.success }]}>
              🎉 Your order is ready!
            </Text>
          )}
        </View>
      )}

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  activeCard: {
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  items: {
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 60,
    height: 3,
    marginHorizontal: 4,
    borderRadius: 1.5,
  },
  readyText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});