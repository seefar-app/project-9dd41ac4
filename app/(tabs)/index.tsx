import { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Animated,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { LoyaltyCard } from '@/components/shared/LoyaltyCard';
import { MenuItemCard } from '@/components/shared/MenuItemCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';
import { format } from 'date-fns';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { 
    menuItems, 
    menuLoading, 
    fetchMenuItems,
    loyaltyCard,
    fetchLoyaltyCard,
    tiers,
    notifications,
    orders,
    fetchOrders,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchMenuItems(),
      fetchLoyaltyCard(user?.id || ''),
      fetchOrders(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const currentTier = tiers.find(t => t.name === loyaltyCard?.tier) || tiers[0];
  const featuredItems = menuItems.filter(item => item.available).slice(0, 4);
  const activeOrders = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ThemedView style={styles.container}>
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
        <LinearGradient
          colors={['#059669', '#10b981', '#34d399']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <Animated.View 
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{user?.firstName || 'Guest'} 👋</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable 
                  style={styles.headerButton}
                  onPress={() => {}}
                >
                  <Ionicons name="notifications-outline" size={24} color="#ffffff" />
                  {unreadNotifications > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>{unreadNotifications}</Text>
                    </View>
                  )}
                </Pressable>
                <Avatar 
                  source={user?.avatar} 
                  name={`${user?.firstName} ${user?.lastName}`}
                  size="md"
                />
              </View>
            </View>

            {loyaltyCard && (
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Ionicons name="leaf" size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statValue}>{loyaltyCard.balance.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={styles.statItem}>
                  <Ionicons name="star" size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statValue}>{currentTier.displayName}</Text>
                  <Text style={styles.statLabel}>Tier</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={20} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.statValue}>{currentTier.discountPercentage}%</Text>
                  <Text style={styles.statLabel}>Discount</Text>
                </View>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Active Order Banner */}
          {activeOrders.length > 0 && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Pressable 
                onPress={() => router.push('/(tabs)/orders')}
                style={[styles.activeOrderBanner, { backgroundColor: colors.secondary }, Shadows.md]}
              >
                <View style={[styles.activeOrderIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="cafe" size={20} color="#ffffff" />
                </View>
                <View style={styles.activeOrderInfo}>
                  <Text style={[styles.activeOrderTitle, { color: colors.text }]}>
                    Order #{activeOrders[0].qrCode}
                  </Text>
                  <Text style={[styles.activeOrderStatus, { color: colors.primary }]}>
                    {activeOrders[0].status === 'ready' 
                      ? '🎉 Ready for pickup!' 
                      : `${activeOrders[0].status.charAt(0).toUpperCase() + activeOrders[0].status.slice(1)}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            </Animated.View>
          )}

          {/* Loyalty Card */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <ThemedText size="lg" weight="bold">Your Loyalty Card</ThemedText>
              <Pressable onPress={() => router.push('/rewards/catalog')}>
                <ThemedText variant="primary" weight="semibold">View Rewards</ThemedText>
              </Pressable>
            </View>
            {loyaltyCard ? (
              <LoyaltyCard 
                card={loyaltyCard} 
                tier={currentTier}
                userName={`${user?.firstName} ${user?.lastName}`}
              />
            ) : (
              <Skeleton width="100%" height={200} borderRadius={20} />
            )}
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.quickActions}>
              <Pressable 
                style={[styles.quickAction, { backgroundColor: colors.card }, Shadows.sm]}
                onPress={() => router.push('/(tabs)/menu')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="cafe" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Order Now</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickAction, { backgroundColor: colors.card }, Shadows.sm]}
                onPress={() => router.push('/rewards/catalog')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="gift" size={22} color="#F59E0B" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Redeem</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickAction, { backgroundColor: colors.card }, Shadows.sm]}
                onPress={() => {}}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="qr-code" size={22} color="#3B82F6" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Scan</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickAction, { backgroundColor: colors.card }, Shadows.sm]}
                onPress={() => router.push('/(tabs)/orders')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
                  <Ionicons name="time" size={22} color="#EC4899" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>History</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Featured Items */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <ThemedText size="lg" weight="bold">Featured Drinks</ThemedText>
              <Pressable onPress={() => router.push('/(tabs)/menu')}>
                <ThemedText variant="primary" weight="semibold">See All</ThemedText>
              </Pressable>
            </View>
            {menuLoading ? (
              <View>
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
              >
                {featuredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    compact
                    onPress={() => router.push('/(tabs)/menu')}
                  />
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* Promo Banner */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Pressable style={[styles.promoBanner, Shadows.lg]}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoGradient}
              >
                <View style={styles.promoContent}>
                  <View style={styles.promoBadge}>
                    <Ionicons name="sparkles" size={16} color="#F59E0B" />
                    <Text style={styles.promoBadgeText}>Limited Time</Text>
                  </View>
                  <Text style={styles.promoTitle}>Double Points Tuesday!</Text>
                  <Text style={styles.promoSubtitle}>Earn 2x points on all purchases every Tuesday</Text>
                </View>
                <View style={styles.promoIcon}>
                  <Ionicons name="star" size={60} color="rgba(255,255,255,0.3)" />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  activeOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  activeOrderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderInfo: {
    flex: 1,
    marginLeft: 14,
  },
  activeOrderTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeOrderStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '23%',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredList: {
    paddingRight: 20,
  },
  promoBanner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    padding: 20,
    minHeight: 120,
  },
  promoContent: {
    flex: 1,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  promoBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  promoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});