import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';

type ProfileTab = 'account' | 'payment' | 'preferences' | 'help';

const TABS: { id: ProfileTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'account', label: 'Account', icon: 'person-outline' },
  { id: 'payment', label: 'Payment', icon: 'card-outline' },
  { id: 'preferences', label: 'Preferences', icon: 'settings-outline' },
  { id: 'help', label: 'Help', icon: 'help-circle-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const { loyaltyCard, tiers, paymentCards } = useStore();

  const [selectedTab, setSelectedTab] = useState<ProfileTab>('account');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const currentTier = tiers.find((t) => t.name === loyaltyCard?.tier) || tiers[0];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const renderAccountTab = () => (
    <View>
      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <View style={styles.menuItemText}>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>Full Name</Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <View style={styles.menuItemText}>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>Email</Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <View style={styles.menuItemText}>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>Phone</Text>
                <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                  {user?.phone}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="finger-print-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Biometric Login</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </Pressable>
        </View>
      </Card>
    </View>
  );

  const renderPaymentTab = () => (
    <View>
      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Methods</Text>
            <Pressable>
              <Text style={[styles.addButton, { color: colors.primary }]}>+ Add</Text>
            </Pressable>
          </View>
          {paymentCards.map((card) => (
            <Pressable key={card.id} style={styles.paymentCard}>
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor:
                        card.brand === 'visa'
                          ? '#1A1F71'
                          : card.brand === 'mastercard'
                          ? '#EB001B'
                          : '#006FCF',
                    },
                  ]}
                >
                  <Ionicons name="card" size={18} color="#ffffff" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    {card.brand.toUpperCase()} •••• {card.last4}
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    Expires {card.expiryMonth}/{card.expiryYear}
                  </Text>
                </View>
              </View>
              {card.isDefault && (
                <Badge label="Default" variant="success" size="sm" />
              )}
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Digital Wallets</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="logo-apple" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Apple Pay</Text>
            </View>
            <Badge label="Connected" variant="success" size="sm" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="logo-google" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Google Pay</Text>
            </View>
            <Text style={[styles.connectText, { color: colors.primary }]}>Connect</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );

  const renderPreferencesTab = () => (
    <View>
      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Email Updates</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="megaphone-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Promotional Offers</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>System</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );

  const renderHelpTab = () => (
    <View>
      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>FAQs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <View style={styles.menuItem}>
            <Text style={[styles.menuItemTitle, { color: colors.text }]}>App Version</Text>
            <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="destructive"
        fullWidth
        icon="log-out-outline"
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#059669', '#10b981', '#34d399']}
          style={[styles.profileHeader, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.profileInfo}>
            <Avatar
              source={user?.avatar}
              name={`${user?.firstName} ${user?.lastName}`}
              size="xl"
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <View style={styles.tierBadge}>
                <Ionicons name="star" size={14} color={currentTier.color} />
                <Text style={[styles.tierText, { color: currentTier.color }]}>
                  {currentTier.displayName} Member
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{loyaltyCard?.balance.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{loyaltyCard?.lifetimePoints.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Lifetime</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{currentTier.discountPercentage}%</Text>
              <Text style={styles.statLabel}>Discount</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {TABS.map((tab) => {
              const isSelected = selectedTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setSelectedTab(tab.id)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={18}
                    color={isSelected ? '#ffffff' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isSelected ? '#ffffff' : colors.text },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {selectedTab === 'account' && renderAccountTab()}
          {selectedTab === 'payment' && renderPaymentTab()}
          {selectedTab === 'preferences' && renderPreferencesTab()}
          {selectedTab === 'help' && renderHelpTab()}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileText: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabsContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
  },
  tabs: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 14,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
  },
});