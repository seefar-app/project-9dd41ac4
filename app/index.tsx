import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200' }}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(5,150,105,0.3)', 'rgba(5,150,105,0.85)', 'rgba(4,120,87,0.95)']}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          <Animated.View 
            style={[
              styles.logoSection,
              { opacity: fadeAnim, transform: [{ scale: logoScale }] }
            ]}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={56} color="#059669" />
            </View>
            <Text style={styles.brandName}>Forest Brew</Text>
            <Text style={styles.tagline}>Nature's finest coffee experience</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.featuresSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="gift-outline" size={24} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Earn rewards with every purchase</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="flash-outline" size={24} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Skip the line, order ahead</Text>
              </View>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="star-outline" size={24} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Exclusive member perks</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="leaf-outline" size={24} color="#ffffff" />
                </View>
                <Text style={styles.featureText}>Sustainable, eco-friendly</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + 24, opacity: fadeAnim }
          ]}
        >
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="secondary"
            size="lg"
            fullWidth
            icon="arrow-forward"
            iconPosition="right"
          />
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});