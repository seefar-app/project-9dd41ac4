export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  currentTier: TierName;
  avatar: string;
  createdAt: Date;
  referralCode: string;
}

export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Tier {
  name: TierName;
  displayName: string;
  minPoints: number;
  benefits: string[];
  discountPercentage: number;
  pointsMultiplier: number;
  color: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
  preparationTime: number;
  calories?: number;
  sizes: Size[];
  customizations: Customization[];
}

export type MenuCategory = 'coffee' | 'tea' | 'pastries' | 'sandwiches' | 'smoothies' | 'seasonal';

export interface Size {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Customization {
  id: string;
  name: string;
  price: number;
  category: 'milk' | 'syrup' | 'topping' | 'extra';
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize: Size;
  selectedCustomizations: Customization[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  estimatedReadyTime: Date;
  completedAt?: Date;
  qrCode: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  size: string;
  customizations: string[];
  price: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'points' | 'mixed';

export interface LoyaltyCard {
  userId: string;
  cardNumber: string;
  balance: number;
  tier: TierName;
  pointsToNextTier: number;
  lifetimePoints: number;
  memberSince: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'free_drink' | 'discount' | 'free_food' | 'merchandise';
  image: string;
  available: boolean;
  expiryDays: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  points: number;
  amount?: number;
  description: string;
  createdAt: Date;
  orderId?: string;
}

export interface PaymentCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex';
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'points' | 'general';
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}