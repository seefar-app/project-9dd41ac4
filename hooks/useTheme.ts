import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useTheme() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return {
    colors,
    isDark,
    colorScheme,
  };
}