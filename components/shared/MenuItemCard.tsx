import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MenuItem } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
  compact?: boolean;
}

export function MenuItemCard({ item, onPress, compact = false }: MenuItemCardProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (compact) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.compactContainer]}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.compactCard, { backgroundColor: colors.card }, Shadows.sm]}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.compactImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.compactContent}>
            <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.compactPrice, { color: colors.primary }]}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
          {!item.available && (
            <View style={[styles.unavailableBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.unavailableText}>Sold Out</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: colors.card }, Shadows.md]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.category === 'seasonal' && (
                <View style={[styles.seasonalBadge, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="sparkles" size={10} color={colors.accent} />
                  <Text style={[styles.seasonalText, { color: colors.accent }]}>Limited</Text>
                </View>
              )}
            </View>
            <Text style={[styles.price, { color: colors.primary }]}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.footer}>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                {item.preparationTime} min
              </Text>
              {item.calories && (
                <>
                  <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                    {item.calories} cal
                  </Text>
                </>
              )}
            </View>
            <View style={[styles.addButton, { backgroundColor: colors.secondary }]}>
              <Ionicons name="add" size={18} color={colors.primary} />
            </View>
          </View>
        </View>
        {!item.available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableOverlayText}>Sold Out</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  seasonalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  seasonalText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableOverlayText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  compactContainer: {
    width: 150,
    marginRight: 12,
  },
  compactCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  compactImage: {
    width: '100%',
    height: 100,
  },
  compactContent: {
    padding: 10,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});