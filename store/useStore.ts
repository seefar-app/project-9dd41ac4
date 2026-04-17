import { create } from 'zustand';
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

const mockSizes: Size[] = [
  { id: 'small', name: 'Small', priceModifier: 0 },
  { id: 'medium', name: 'Medium', priceModifier: 0.70 },
  { id: 'large', name: 'Large', priceModifier: 1.40 },
];

const mockCustomizations: Customization[] = [
  { id: 'oat-milk', name: 'Oat Milk', price: 0.80, category: 'milk' },
  { id: 'almond-milk', name: 'Almond Milk', price: 0.80, category: 'milk' },
  { id: 'coconut-milk', name: 'Coconut Milk', price: 0.80, category: 'milk' },
  { id: 'vanilla-syrup', name: 'Vanilla Syrup', price: 0.60, category: 'syrup' },
  { id: 'caramel-syrup', name: 'Caramel Syrup', price: 0.60, category: 'syrup' },
  { id: 'hazelnut-syrup', name: 'Hazelnut Syrup', price: 0.60, category: 'syrup' },
  { id: 'whipped-cream', name: 'Whipped Cream', price: 0.50, category: 'topping' },
  { id: 'extra-shot', name: 'Extra Espresso Shot', price: 0.90, category: 'extra' },
];

const mockMenuItems: MenuItem[] = [
  {
    id: 'menu-001',
    name: 'Forest Latte',
    description: 'Our signature espresso with creamy steamed milk, infused with hints of vanilla and forest honey',
    price: 5.50,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    available: true,
    preparationTime: 5,
    calories: 180,
    sizes: mockSizes,
    customizations: mockCustomizations,
  },
  {
    id: 'menu-002',
    name: 'Emerald Cold Brew',
    description: 'Smooth, refreshing cold brew steeped for 20 hours with a touch of organic matcha',
    price: 5.00,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
    available: true,
    preparationTime: 2,
    calories: 15,
    sizes: mockSizes,
    customizations: mockCustomizations,
  },
  {
    id: 'menu-003',
    name: 'Cappuccino Classico',
    description: 'Traditional Italian cappuccino with velvety microfoam and a dusting of cocoa',
    price: 4.75,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    available: true,
    preparationTime: 4,
    calories: 120,
    sizes: mockSizes,
    customizations: mockCustomizations,
  },
  {
    id: 'menu-004',
    name: 'Caramel Macchiato',
    description: 'Espresso marked with vanilla and topped with buttery caramel drizzle',
    price: 5.25,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
    available: true,
    preparationTime: 5,
    calories: 250,
    sizes: mockSizes,
    customizations: mockCustomizations,
  },
  {
    id: 'menu-005',
    name: 'Matcha Green Dream',
    description: 'Premium ceremonial grade matcha whisked with steamed oat milk',
    price: 5.75,
    category: 'tea',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400',
    available: true,
    preparationTime: 4,
    calories: 160,
    sizes: mockSizes,
    customizations: mockCustomizations.filter(c => c.category !== 'extra'),
  },
  {
    id: 'menu-006',
    name: 'Earl Grey Fog',
    description: 'Earl grey tea with steamed milk and a hint of lavender honey',
    price: 4.50,
    category: 'tea',
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
    available: true,
    preparationTime: 3,
    calories: 140,
    sizes: mockSizes,
    customizations: mockCustomizations.filter(c => c.category !== 'extra'),
  },
  {
    id: 'menu-007',
    name: 'Almond Croissant',
    description: 'Buttery croissant filled with almond cream and topped with sliced almonds',
    price: 4.25,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    available: true,
    preparationTime: 0,
    calories: 420,
    sizes: [],
    customizations: [],
  },
  {
    id: 'menu-008',
    name: 'Avocado Toast',
    description: 'Smashed avocado on sourdough with cherry tomatoes, microgreens, and everything seasoning',
    price: 8.50,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    available: true,
    preparationTime: 7,
    calories: 380,
    sizes: [],
    customizations: [],
  },
  {
    id: 'menu-009',
    name: 'Berry Bliss Smoothie',
    description: 'Mixed berries, banana, Greek yogurt, and a touch of forest honey',
    price: 6.50,
    category: 'smoothies',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    available: true,
    preparationTime: 3,
    calories: 280,
    sizes: mockSizes,
    customizations: [],
  },
  {
    id: 'menu-010',
    name: 'Pumpkin Spice Latte',
    description: 'Seasonal favorite with real pumpkin, warm spices, and whipped cream',
    price: 5.95,
    category: 'seasonal',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    available: true,
    preparationTime: 5,
    calories: 380,
    sizes: mockSizes,
    customizations: mockCustomizations,
  },
];

const mockRewards: Reward[] = [
  {
    id: 'reward-001',
    name: 'Free Forest Latte',
    description: 'Enjoy our signature drink on us!',
    pointsCost: 150,
    category: 'free_drink',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    available: true,
    expiryDays: 30,
  },
  {
    id: 'reward-002',
    name: 'Free Pastry',
    description: 'Choose any pastry from our selection',
    pointsCost: 100,
    category: 'free_food',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    available: true,
    expiryDays: 30,
  },
  {
    id: 'reward-003',
    name: '20% Off Order',
    description: 'Get 20% off your entire order',
    pointsCost: 200,
    category: 'discount',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
    available: true,
    expiryDays: 14,
  },
  {
    id: 'reward-004',
    name: 'Free Cold Brew',
    description: 'Refreshing cold brew on the house',
    pointsCost: 125,
    category: 'free_drink',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
    available: true,
    expiryDays: 30,
  },
  {
    id: 'reward-005',
    name: 'Forest Brew Tumbler',
    description: 'Exclusive branded reusable tumbler',
    pointsCost: 500,
    category: 'merchandise',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    available: true,
    expiryDays: 60,
  },
  {
    id: 'reward-006',
    name: '$5 Off Order',
    description: 'Get $5 off orders over $15',
    pointsCost: 75,
    category: 'discount',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
    available: true,
    expiryDays: 14,
  },
];

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

const mockOrders: Order[] = [
  {
    id: 'order-001',
    userId: 'user-001',
    items: [
      {
        id: 'item-001',
        orderId: 'order-001',
        menuItemId: 'menu-001',
        name: 'Forest Latte',
        quantity: 1,
        size: 'Large',
        customizations: ['Oat Milk', 'Extra Espresso Shot'],
        price: 8.20,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
      },
      {
        id: 'item-002',
        orderId: 'order-001',
        menuItemId: 'menu-007',
        name: 'Almond Croissant',
        quantity: 1,
        size: '-',
        customizations: [],
        price: 4.25,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
      },
    ],
    subtotal: 12.45,
    tax: 1.12,
    discount: 1.25,
    total: 12.32,
    pointsEarned: 18,
    pointsRedeemed: 0,
    paymentMethod: 'card',
    status: 'preparing',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    estimatedReadyTime: new Date(Date.now() + 1000 * 60 * 8),
    qrCode: 'FRBW-001-2024',
  },
  {
    id: 'order-002',
    userId: 'user-001',
    items: [
      {
        id: 'item-003',
        orderId: 'order-002',
        menuItemId: 'menu-002',
        name: 'Emerald Cold Brew',
        quantity: 2,
        size: 'Medium',
        customizations: [],
        price: 11.40,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
      },
    ],
    subtotal: 11.40,
    tax: 1.03,
    discount: 0,
    total: 12.43,
    pointsEarned: 19,
    pointsRedeemed: 0,
    paymentMethod: 'apple_pay',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    estimatedReadyTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 10),
    qrCode: 'FRBW-002-2024',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 'trans-001',
    userId: 'user-001',
    type: 'earned',
    points: 18,
    amount: 12.32,
    description: 'Order #FRBW-001-2024',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    orderId: 'order-001',
  },
  {
    id: 'trans-002',
    userId: 'user-001',
    type: 'bonus',
    points: 50,
    description: 'Double Points Tuesday!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'trans-003',
    userId: 'user-001',
    type: 'earned',
    points: 19,
    amount: 12.43,
    description: 'Order #FRBW-002-2024',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    orderId: 'order-002',
  },
  {
    id: 'trans-004',
    userId: 'user-001',
    type: 'redeemed',
    points: -150,
    description: 'Free Forest Latte Reward',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
];

const mockLoyaltyCard: LoyaltyCard = {
  userId: 'user-001',
  cardNumber: '4532 8901 2345 6789',
  balance: 2450,
  tier: 'gold',
  pointsToNextTier: 2550,
  lifetimePoints: 4250,
  memberSince: new Date('2023-06-15'),
};

const mockPaymentCards: PaymentCard[] = [
  {
    id: 'card-001',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
  {
    id: 'card-002',
    last4: '8888',
    brand: 'mastercard',
    expiryMonth: 8,
    expiryYear: 2025,
    isDefault: false,
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Your order is ready! 🎉',
    body: 'Order #FRBW-001-2024 is ready for pickup',
    type: 'order',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
    data: { orderId: 'order-001' },
  },
  {
    id: 'notif-002',
    title: 'Double Points Tuesday! 🌟',
    body: 'Earn 2x points on all purchases today',
    type: 'promo',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'notif-003',
    title: 'You earned 50 bonus points!',
    body: 'Thanks for being a loyal customer',
    type: 'points',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
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
  transactions: mockTransactions,
  loyaltyCard: null,
  tiers: mockTiers,
  paymentCards: mockPaymentCards,
  selectedPaymentMethod: 'card-001',
  notifications: mockNotifications,

  fetchMenuItems: async () => {
    set({ menuLoading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ menuItems: mockMenuItems, menuLoading: false });
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
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const tax = cartTotal * 0.09;
    const discount = loyaltyCard ? (cartTotal * (mockTiers.find(t => t.name === loyaltyCard.tier)?.discountPercentage || 0) / 100) : 0;
    const pointsDiscount = pointsToRedeem > 0 ? pointsToRedeem / 100 : 0;
    const total = cartTotal + tax - discount - pointsDiscount;
    const pointsEarned = Math.floor(total * (mockTiers.find(t => t.name === loyaltyCard?.tier)?.pointsMultiplier || 1));
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: 'user-001',
      items: cart.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        orderId: '',
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        size: item.selectedSize?.name || '-',
        customizations: item.selectedCustomizations.map(c => c.name),
        price: item.totalPrice,
        image: item.menuItem.image,
      })),
      subtotal: cartTotal,
      tax,
      discount: discount + pointsDiscount,
      total,
      pointsEarned,
      pointsRedeemed: pointsToRedeem,
      paymentMethod: paymentMethod as any,
      status: 'confirmed',
      createdAt: new Date(),
      estimatedReadyTime: new Date(Date.now() + 1000 * 60 * 10),
      qrCode: `FRBW-${Date.now().toString().slice(-3)}-2024`,
    };
    
    newOrder.items.forEach(item => { item.orderId = newOrder.id; });
    
    set({ 
      orders: [newOrder, ...orders],
      activeOrder: newOrder,
      cart: [],
      cartTotal: 0,
    });
    
    // Simulate status updates
    setTimeout(() => {
      set(state => ({
        orders: state.orders.map(o => o.id === newOrder.id ? { ...o, status: 'preparing' } : o),
        activeOrder: state.activeOrder?.id === newOrder.id ? { ...state.activeOrder, status: 'preparing' } : state.activeOrder,
      }));
    }, 3000);
    
    setTimeout(() => {
      set(state => ({
        orders: state.orders.map(o => o.id === newOrder.id ? { ...o, status: 'ready' } : o),
        activeOrder: state.activeOrder?.id === newOrder.id ? { ...state.activeOrder, status: 'ready' } : state.activeOrder,
      }));
    }, 8000);
    
    return newOrder;
  },

  fetchOrders: async () => {
    set({ ordersLoading: true });
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ orders: mockOrders, ordersLoading: false });
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o),
      activeOrder: state.activeOrder?.id === orderId ? { ...state.activeOrder, status } : state.activeOrder,
    }));
  },

  fetchRewards: async () => {
    set({ rewardsLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ rewards: mockRewards, rewardsLoading: false });
  },

  redeemReward: async (rewardId) => {
    const { rewards, loyaltyCard, transactions } = get();
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward || !loyaltyCard || loyaltyCard.balance < reward.pointsCost) {
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTransaction: Transaction = {
      id: `trans-${Date.now()}`,
      userId: 'user-001',
      type: 'redeemed',
      points: -reward.pointsCost,
      description: `${reward.name} Reward`,
      createdAt: new Date(),
    };
    
    set({
      loyaltyCard: {
        ...loyaltyCard,
        balance: loyaltyCard.balance - reward.pointsCost,
      },
      transactions: [newTransaction, ...transactions],
    });
    
    return true;
  },

  fetchLoyaltyCard: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ loyaltyCard: mockLoyaltyCard });
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

  markNotificationRead: (notificationId) => {
    const { notifications } = get();
    set({
      notifications: notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    });
  },
}));