import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'primary' | 'accent';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function ThemedText({ 
  style, 
  variant = 'default', 
  size = 'base',
  weight = 'normal',
  ...props 
}: ThemedTextProps) {
  const { colors } = useTheme();
  
  const colorMap = {
    default: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    primary: colors.primary,
    accent: colors.accent,
  };

  const sizeMap = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  };

  const weightMap = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  };

  return (
    <Text 
      style={[
        { 
          color: colorMap[variant], 
          fontSize: sizeMap[size],
          fontWeight: weightMap[weight],
        }, 
        style
      ]} 
      {...props} 
    />
  );
}