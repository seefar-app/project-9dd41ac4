import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'card';
}

export function ThemedView({ style, variant = 'default', ...props }: ThemedViewProps) {
  const { colors } = useTheme();
  
  const backgroundColor = variant === 'secondary' 
    ? colors.backgroundSecondary 
    : variant === 'card' 
    ? colors.card 
    : colors.background;

  return <View style={[{ backgroundColor }, style]} {...props} />;
}