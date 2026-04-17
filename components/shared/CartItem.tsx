import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CartItem as CartItemType } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { colors } = useTheme();

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdateQuantity(item.quantity + 1);
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    } else {
      onRemove();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Image
        source={{ uri: item.menuItem.image }}
        style={styles.image}
        contentFit="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.menuItem.name}
            </Text>
            {item.selectedSize?.name && (
              <Text style={[styles.size, { color: colors.textSecondary }]}>
                {item.selectedSize.name}
              </Text>
            )}
          </View>
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
          </Pressable>
        </View>
        
        {item.selectedCustomizations.length > 0 && (
          <Text style={[styles.customizations, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.selectedCustomizations.map(c => c.name).join(', ')}
          </Text>
        )}
        
        {item.specialInstructions && (
          <Text style={[styles.instructions, { color: colors.textTertiary }]} numberOfLines={1}>
            Note: {item.specialInstructions}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.quantityControl}>
            <Pressable
              onPress={handleDecrement}
              style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Ionicons 
                name={item.quantity === 1 ? 'trash-outline' : 'remove'} 
                size={18} 
                color={item.quantity === 1 ? colors.error : colors.text} 
              />
            </Pressable>
            <Text style={[styles.quantity, { color: colors.text }]}>
              {item.quantity}
            </Text>
            <Pressable
              onPress={handleIncrement}
              style={[styles.quantityButton, { backgroundColor: colors.secondary }]}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
            </Pressable>
          </View>
          
          <Text style={[styles.price, { color: colors.primary }]}>
            ${item.totalPrice.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  size: {
    fontSize: 13,
    marginTop: 2,
  },
  customizations: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  instructions: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
  },
});