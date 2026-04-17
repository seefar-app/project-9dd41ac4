import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  Reward,
  Transaction,
  LoyaltyCard,
  Tier,
  TierName,
  Size,
  Customization,
  PaymentCard,
  Notification,
} from '@/types';

interface StoreState {
  // Menu
  menuItems: MenuItem[];
  menuLoading: boolean;
  selectedCategory: string | null;
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  
  // Orders
  orders: Order[];
  activeOrder: Order | null;
  ordersLoading: boolean;
  
  // Rewards
  rewards: Reward[];
  rewardsLoading: boolean;
  
  // Transactions
  transactions: Transaction[];
  
  // Loyalty
  loyaltyCard: LoyaltyCard | null;
  tiers: Tier[];
  
  // Payment
  paymentCards: PaymentCard[];
  selectedPaymentMethod: string | null;
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  fetchMenuItems: () => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  addToCart: (item: MenuItem, size: Size, customizations: Customization[], quantity: number, instructions?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (paymentMethod: string, pointsToRedeem?: number) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  fetchRewards: () => Promise<void>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  fetchLoyaltyCard: (userId: string) => Promise<void>;
  addPaymentCard: (card: Omit<PaymentCard, 'id'>) => void;
  removePaymentCard: (cardId: string) => void;
  setDefaultPaymentCard: (cardId: string) => void;
  markNotificationRead: (notificationId: string) => void;
}

const mockTiers: Tier[] = [
  {
    name: 'bronze',
    displayName: 'Bronze',
    minPoints: 0,
    benefits: ['1 point per $1 spent', 'Birthday reward', 'Member-only offers'],
    discountPercentage: 0,
    pointsMultiplier: 1,
    color: '#CD7F32',
  },
  {
    name: 'silver',
    displayName: 'Silver',
    minPoints: 500,
    benefits: ['1.25 points per $1 spent', 'Free size upgrade', 'Early access to new items'],
    discountPercentage: 5,
    pointsMultiplier: 1.25,
    color: '#C0C0C0',
  },
  {
    name: 'gold',
    displayName: 'Gold',
    minPoints: 1500,
    benefits: ['1.5 points per $1 spent', '10% discount on all orders', 'Priority pickup'],
    discountPercentage: 10,
    pointsMultiplier: 1.5,
    color: '#FFD700',
  },
  {
    name: 'platinum',
    displayName: 'Platinum',
    minPoints: 5000,
    benefits: ['2 points per $1 spent', '15% discount', 'Free delivery', 'Exclusive events'],
    discountPercentage: 15,
    pointsMultiplier: 2,
    color: '#E5E4E2',
  },
];

export const useStore = create<StoreState>((set, get) => ({
  menuItems: [],
  menuLoading: false,
  selectedCategory: null,
  cart: [],
  cartTotal: 0,
  orders: [],
  activeOrder: null,
  ordersLoading: false,
  rewards: [],
  rewardsLoading: false,
  transactions: [],
  loyaltyCard: null,
  tiers: mockTiers,
  paymentCards: [],
  selectedPaymentMethod: null,
  notifications: [],

  fetchMenuItems: async () => {
    set({ menuLoading: true });
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);
      
      if (error) throw error;
      
      // Fetch sizes and customizations
      const { data: sizesData, error: sizesError } = await supabase
        .from('sizes')
        .select('*');
      
      if (sizesError) throw sizesError;
      
      const { data: customizationsData, error: customizationsError } = await supabase
        .from('customizations')
        .select('*');
      
      if (customizationsError) throw customizationsError;
      
      const sizes: Size[] = (sizesData || []).map(s => ({
        id: s.id,
        name: s.name,
        priceModifier: parseFloat(s.priceModifier || 0),
      }));
      
      const customizations: Customization[] = (customizationsData || []).map(c => ({
        id: c.id,
        name: c.name,
        price: parseFloat(c.price || 0),
        category: c.category,
      }));
      
      const menuItems: MenuItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        image: item.image,
        available: item.available,
        preparationTime: item.preparationTime,
        calories: item.calories,
        sizes: item.category === 'pastries' || item.category === 'sandwiches' ? [] : sizes,
        customizations: item.category === 'pastries' || item.category === 'sandwiches' ? [] : customizations,
      }));
      
      set({ menuItems, menuLoading: false });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      set({ menuLoading: false });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  addToCart: (item, size, customizations, quantity, instructions) => {
    const { cart } = get();
    const customizationsTotal = customizations.reduce((sum, c) => sum + c.price, 0);
    const itemPrice = (item.price + (size?.priceModifier || 0) + customizationsTotal) * quantity;
    
    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      menuItem: item,
      quantity,
      selectedSize: size,
      selectedCustomizations: customizations,
      specialInstructions: instructions,
      totalPrice: itemPrice,
    };
    
    const newCart = [...cart, cartItem];
    const newTotal = newCart.reduce((sum, ci) => sum + ci.totalPrice, 0);
    
    set({ cart: newCart, cartTotal: newTotal });
  },

  removeFromCart: (cartItemId) => {
    const { cart } = get();
    const newCart = cart.filter(item => item.id !== cartItemId);
    const newTotal = newCart.reduce((sum, ci) => sum + ci.totalPrice, 0);
    set({ cart: newCart, cartTotal: newTotal });
  },

  updateCartItemQuantity: (cartItemId, quantity) => {
    const { cart } = get();
    const newCart = cart.map(item => {
      if (item.id === cartItemId) {
        const basePrice = item.menuItem.price + (item.selectedSize?.priceModifier || 0) +
          item.selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
        return { ...item, quantity, totalPrice: basePrice * quantity };
      }
      return item;
    });
    const newTotal = newCart.reduce((sum, ci) => sum + ci.totalPrice, 0);
    set({ cart: newCart, cartTotal: newTotal });
  },

  clearCart: () => {
    set({ cart: [], cartTotal: 0 });
  },

  createOrder: async (paymentMethod, pointsToRedeem = 0) => {
    const { cart, cartTotal, orders, loyaltyCard } = get();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const tax = cartTotal * 0.09;
      const discount = loyaltyCard ? (cartTotal * (mockTiers.find(t => t.name === loyaltyCard.tier)?.discountPercentage || 0) / 100) : 0;
      const pointsDiscount = pointsToRedeem > 0 ? pointsToRedeem / 100 : 0;
      const total = cartTotal + tax - discount - pointsDiscount;
      const pointsEarned = Math.floor(total * (mockTiers.find(t => t.name === loyaltyCard?.tier)?.pointsMultiplier || 1));
      
      const estimatedReadyTime = new Date(Date.now() + 1000 * 60 * 10);
      const qrCode = `FRBW-${Date.now().toString().slice(-3)}-2024`;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          userId: user.id,
          subtotal: cartTotal,
          tax,
          discount: discount + pointsDiscount,
          total,
          pointsEarned,
          pointsRedeemed: pointsToRedeem,
          paymentMethod,
          status: 'confirmed',
          estimatedReadyTime,
          qrCode,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Insert order items
      const orderItems = cart.map((item, idx) => ({
        orderId: orderData.id,
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        size: item.selectedSize?.name || '-',
        customizations: item.selectedCustomizations.map(c => c.name),
        price: item.totalPrice,
        image: item.menuItem.image,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Create transaction record
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          userId: user.id,
          type: 'earned',
          points: pointsEarned,
          amount: total,
          description: `Order #${qrCode}`,
          orderId: orderData.id,
        });
      
      if (transError) throw transError;
      
      // Update loyalty card if points redeemed
      if (pointsToRedeem > 0 && loyaltyCard) {
        const { error: loyaltyError } = await supabase
          .from('loyalty_cards')
          .update({
            balance: loyaltyCard.balance - pointsToRedeem,
          })
          .eq('userId', user.id);
        
        if (loyaltyError) throw loyaltyError;
      }
      
      const newOrder: Order = {
        id: orderData.id,
        userId: user.id,
        items: orderItems.map((item, idx) => ({
          id: `item-${orderData.id}-${idx}`,
          orderId: orderData.id,
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          size: item.size,
          customizations: item.customizations,
          price: item.price,
          image: item.image,
        })),
        subtotal: cartTotal,
        tax,
        discount: discount + pointsDiscount,
        total,
        pointsEarned,
        pointsRedeemed: pointsToRedeem,
        paymentMethod: paymentMethod as any,
        status: 'confirmed',
        createdAt: new Date(orderData.created_at),
        estimatedReadyTime,
        qrCode,
      };
      
      set({ 
        orders: [newOrder, ...orders],
        activeOrder: newOrder,
        cart: [],
        cartTotal: 0,
      });
      
      // Simulate status updates
      setTimeout(async () => {
        try {
          await supabase
            .from('orders')
            .update({ status: 'preparing' })
            .eq('id', orderData.id);
          
          set(state => ({
            orders: state.orders.map(o => o.id === orderData.id ? { ...o, status: 'preparing' } : o),
            activeOrder: state.activeOrder?.id === orderData.id ? { ...state.activeOrder, status: 'preparing' } : state.activeOrder,
          }));
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      }, 3000);
      
      setTimeout(async () => {
        try {
          await supabase
            .from('orders')
            .update({ status: 'ready' })
            .eq('id', orderData.id);
          
          set(state => ({
            orders: state.orders.map(o => o.id === orderData.id ? { ...o, status: 'ready' } : o),
            activeOrder: state.activeOrder?.id === orderData.id ? { ...state.activeOrder, status: 'ready' } : state.activeOrder,
          }));
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      }, 8000);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ ordersLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch order items for each order
      const orders: Order[] = [];
      
      for (const orderData of ordersData || []) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('orderId', orderData.id);
        
        if (itemsError) throw itemsError;
        
        const order: Order = {
          id: orderData.id,
          userId: orderData.userId,
          items: (itemsData || []).map(item => ({
            id: item.id,
            orderId: item.orderId,
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            size: item.size,
            customizations: item.customizations || [],
            price: parseFloat(item.price),
            image: item.image,
          })),
          subtotal: parseFloat(orderData.subtotal),
          tax: parseFloat(orderData.tax),
          discount: parseFloat(orderData.discount),
          total: parseFloat(orderData.total),
          pointsEarned: orderData.pointsEarned,
          pointsRedeemed: orderData.pointsRedeemed,
          paymentMethod: orderData.paymentMethod,
          status: orderData.status,
          createdAt: new Date(orderData.created_at),
          estimatedReadyTime: orderData.estimatedReadyTime ? new Date(orderData.estimatedReadyTime) : undefined,
          completedAt: orderData.completedAt ? new Date(orderData.completedAt) : undefined,
          qrCode: orderData.qrCode,
        };
        
        orders.push(order);
      }
      
      set({ orders, ordersLoading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ ordersLoading: false });
    }
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o),
      activeOrder: state.activeOrder?.id === orderId ? { ...state.activeOrder, status } : state.activeOrder,
    }));
  },

  fetchRewards: async () => {
    set({ rewardsLoading: true });
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('available', true);
      
      if (error) throw error;
      
      const rewards: Reward[] = (data || []).map(reward => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        category: reward.category,
        image: reward.image,
        available: reward.available,
        expiryDays: reward.expiryDays,
      }));
      
      set({ rewards, rewardsLoading: false });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      set({ rewardsLoading: false });
    }
  },

  redeemReward: async (rewardId) => {
    const { rewards, loyaltyCard, transactions } = get();
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward || !loyaltyCard || loyaltyCard.balance < reward.pointsCost) {
      return false;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Create transaction record
      const { data: transactionData, error: transError } = await supabase
        .from('transactions')
        .insert({
          userId: user.id,
          type: 'redeemed',
          points: -reward.pointsCost,
          description: `${reward.name} Reward`,
        })
        .select()
        .single();
      
      if (transError) throw transError;
      
      // Update loyalty card balance
      const { error: loyaltyError } = await supabase
        .from('loyalty_cards')
        .update({
          balance: loyaltyCard.balance - reward.pointsCost,
        })
        .eq('userId', user.id);
      
      if (loyaltyError) throw loyaltyError;
      
      const newTransaction: Transaction = {
        id: transactionData.id,
        userId: user.id,
        type: 'redeemed',
        points: -reward.pointsCost,
        description: `${reward.name} Reward`,
        createdAt: new Date(transactionData.created_at),
      };
      
      set({
        loyaltyCard: {
          ...loyaltyCard,
          balance: loyaltyCard.balance - reward.pointsCost,
        },
        transactions: [newTransaction, ...transactions],
      });
      
      return true;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  },

  fetchLoyaltyCard: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('userId', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const loyaltyCard: LoyaltyCard = {
          userId: data.userId,
          cardNumber: data.cardNumber,
          balance: data.balance,
          tier: data.tier,
          pointsToNextTier: data.pointsToNextTier,
          lifetimePoints: data.lifetimePoints,
          memberSince: new Date(data.memberSince),
        };
        
        set({ loyaltyCard });
      }
      
      // Fetch transactions
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });
      
      if (transError) throw transError;
      
      const transactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        userId: t.userId,
        type: t.type,
        points: t.points,
        amount: t.amount ? parseFloat(t.amount) : undefined,
        description: t.description,
        createdAt: new Date(t.created_at),
        orderId: t.orderId,
      }));
      
      set({ transactions });
    } catch (error) {
      console.error('Error fetching loyalty card:', error);
    }
  },

  addPaymentCard: (card) => {
    const { paymentCards } = get();
    const newCard: PaymentCard = {
      ...card,
      id: `card-${Date.now()}`,
    };
    set({ paymentCards: [...paymentCards, newCard] });
  },

  removePaymentCard: (cardId) => {
    const { paymentCards } = get();
    set({ paymentCards: paymentCards.filter(c => c.id !== cardId) });
  },

  setDefaultPaymentCard: (cardId) => {
    const { paymentCards } = get();
    set({
      paymentCards: paymentCards.map(c => ({
        ...c,
        isDefault: c.id === cardId,
      })),
      selectedPaymentMethod: cardId,
    });
  },

  markNotificationRead: async (notificationId) => {
    const { notifications } = get();
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      set({
        notifications: notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
}));