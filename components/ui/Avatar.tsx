import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy';
  style?: ViewStyle;
}

export function Avatar({
  source,
  name,
  size = 'md',
  showStatus = false,
  status = 'offline',
  style,
}: AvatarProps) {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: 32, text: 12, status: 10 };
      case 'lg':
        return { container: 56, text: 20, status: 16 };
      case 'xl':
        return { container: 80, text: 28, status: 20 };
      default:
        return { container: 44, text: 16, status: 12 };
    }
  };

  const sizeStyles = getSizeStyles();
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const statusColors = {
    online: colors.success,
    offline: colors.textTertiary,
    busy: colors.error,
  };

  return (
    <View style={[styles.container, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            { 
              width: sizeStyles.container, 
              height: sizeStyles.container,
              borderRadius: sizeStyles.container / 2,
            },
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: sizeStyles.container,
              height: sizeStyles.container,
              borderRadius: sizeStyles.container / 2,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: sizeStyles.text }]}>
            {initials}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={[
            styles.statusBadge,
            {
              width: sizeStyles.status,
              height: sizeStyles.status,
              borderRadius: sizeStyles.status / 2,
              backgroundColor: statusColors[status],
              borderColor: colors.card,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#e5e7eb',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});