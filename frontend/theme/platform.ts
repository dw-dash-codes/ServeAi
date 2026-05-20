import { Platform, ViewStyle } from 'react-native';

/**
 * `useNativeDriver` is not supported on web — always returns false for web,
 * true for native.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Creates cross-platform shadow styles.
 * On web, uses boxShadow (required by newer react-native-web).
 * On native, uses the classic shadow* props + elevation.
 */
export function createShadow(
  color: string,
  offsetX: number,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number = 4,
): ViewStyle {
  if (Platform.OS === 'web') {
    // Convert hex/named color + opacity to rgba for boxShadow
    const rgba = hexToRgba(color, opacity);
    return {
      // @ts-ignore — boxShadow is valid on web but not in RN types
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${rgba}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

function hexToRgba(hex: string, opacity: number): string {
  // Handle named colors or non-hex
  if (!hex.startsWith('#')) {
    return `rgba(0, 0, 0, ${opacity})`;
  }
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
