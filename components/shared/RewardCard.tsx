import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Reward } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: () => void;
}

export function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const canRedeem = userPoints >= reward.pointsCost && reward.available;

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
    if (canRedeem) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRedeem();
    }
  };

  const getCategoryIcon = () => {
    switch (reward.category) {
      case 'free_drink':
        return 'cafe';
      case 'free_food':
        return 'fast-food';
      case 'discount':
        return 'pricetag';
      case 'merchandise':
        return 'gift';
      default:
        return 'star';
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!canRedeem}
        style={[
          styles.card,
          { backgroundColor: colors.card },
          Shadows.md,
          !canRedeem && styles.disabledCard,
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: reward.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name={getCategoryIcon()} size={14} color="#ffffff" />
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {reward.name}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {reward.description}
          </Text>
          
          <View style={styles.footer}>
            <View style={[styles.pointsCost, { backgroundColor: colors.secondary }]}>
              <Ionicons name="leaf" size={14} color={colors.primary} />
              <Text style={[styles.pointsText, { color: colors.primary }]}>
                {reward.pointsCost}
              </Text>
            </View>
            
            {canRedeem ? (
              <View style={[styles.redeemButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.redeemText}>Redeem</Text>
              </View>
            ) : (
              <Text style={[styles.needMore, { color: colors.textTertiary }]}>
                {userPoints < reward.pointsCost 
                  ? `Need ${reward.pointsCost - userPoints} more`
                  : 'Unavailable'}
              </Text>
            )}
          </View>
        </View>
        
        {!reward.available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
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
  disabledCard: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
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
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },
  redeemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redeemText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  needMore: {
    fontSize: 13,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});