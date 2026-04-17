import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { OrderCard } from '@/components/shared/OrderCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { OrderStatus } from '@/types';

const STATUS_FILTERS: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'preparing', label: 'Active' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Completed' },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { orders, ordersLoading, fetchOrders } = useStore();

  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filteredOrders =
    selectedFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedFilter);

  const activeOrders = orders.filter((o) =>
    ['confirmed', 'preparing', 'ready'].includes(o.status)
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: colors.background },
        ]}
      >
        <ThemedText size="2xl" weight="bold">
          Orders
        </ThemedText>
        {activeOrders.length > 0 && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {activeOrders.length} active {activeOrders.length === 1 ? 'order' : 'orders'}
          </Text>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {STATUS_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: isSelected ? '#ffffff' : colors.text },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {ordersLoading ? (
          <>
            <Skeleton width="100%" height={200} borderRadius={16} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={200} borderRadius={16} style={{ marginBottom: 12 }} />
          </>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
            <ThemedText size="lg" weight="semibold" style={{ marginTop: 16 }}>
              No orders found
            </ThemedText>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {selectedFilter === 'all'
                ? 'Your order history will appear here'
                : `No ${selectedFilter} orders`}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onPress={() => {}} />
          ))
        )}
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
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
});