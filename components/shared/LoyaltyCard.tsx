import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LoyaltyCard as LoyaltyCardType, Tier } from '@/types';
import { format } from 'date-fns';

interface LoyaltyCardProps {
  card: LoyaltyCardType;
  tier: Tier;
  userName: string;
}

export function LoyaltyCard({ card, tier, userName }: LoyaltyCardProps) {
  const getTierGradient = (): readonly [string, string, ...string[]] => {
    switch (tier.name) {
      case 'bronze':
        return ['#CD7F32', '#D4A574', '#E8C8A0'];
      case 'silver':
        return ['#A8A9AD', '#C0C0C0', '#E8E8E8'];
      case 'gold':
        return ['#D4AF37', '#FFD700', '#FFC125'];
      case 'platinum':
        return ['#B4B4B4', '#E5E4E2', '#F5F5F5'];
      default:
        return ['#059669', '#10b981', '#34d399'];
    }
  };

  const progressPercent = card.pointsToNextTier > 0 
    ? ((card.balance - tier.minPoints) / (card.pointsToNextTier - tier.minPoints + card.balance - tier.minPoints)) * 100
    : 100;

  return (
    <LinearGradient
      colors={getTierGradient()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Ionicons name="leaf" size={24} color="rgba(255,255,255,0.9)" />
          <Text style={styles.brandName}>Forest Brew</Text>
        </View>
        <View style={styles.tierBadge}>
          <Ionicons name="star" size={14} color="rgba(255,255,255,0.9)" />
          <Text style={styles.tierText}>{tier.displayName}</Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Points Balance</Text>
        <Text style={styles.balanceValue}>{card.balance.toLocaleString()}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
        </View>
        {card.pointsToNextTier > 0 && (
          <Text style={styles.progressText}>
            {card.pointsToNextTier.toLocaleString()} points to next tier
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.cardNumber}>{card.cardNumber}</Text>
          <Text style={styles.memberName}>{userName}</Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberSince}>Member since</Text>
          <Text style={styles.memberDate}>{format(card.memberSince, 'MMM yyyy')}</Text>
        </View>
      </View>

      <View style={styles.pattern}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.patternCircle, { left: i * 60 - 20, top: i % 2 === 0 ? -30 : 180 }]} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  balanceContainer: {
    marginTop: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  memberName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  memberInfo: {
    alignItems: 'flex-end',
  },
  memberSince: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  memberDate: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  patternCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});