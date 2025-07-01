/**
 * Style normalizer utility to fix React Native Web style issues
 * Handles invalid opacity and color values that cause toFixed errors
 * Converts deprecated shadow* props to boxShadow for web platform
 */

import { ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;
type StyleProp = Style | Style[] | undefined | null | false;

interface ShadowStyleIOS {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

interface ShadowStyleAndroid {
  elevation?: number;
}

/**
 * Normalizes a numeric value to ensure it's valid for style properties
 */
function normalizeNumericValue(value: any, min: number = 0, max: number = 1): number {
  // Handle null/undefined
  if (value == null) return min;
  
  // Handle boolean values
  if (typeof value === 'boolean') return value ? max : min;
  
  // Handle string values
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return min;
    value = parsed;
  }
  
  // Handle number values
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
  }
  
  // Handle objects (Animated.Value might come as object)
  if (typeof value === 'object' && value !== null) {
    // If it's an Animated.Value, it should be handled by Animated.View
    // For now, return default
    return min;
  }
  
  return min;
}

/**
 * Normalizes opacity values to ensure they're between 0 and 1
 */
function normalizeOpacity(opacity: any): number {
  return normalizeNumericValue(opacity, 0, 1);
}

/**
 * Converts hex color to rgba format
 */
function hexToRgba(hex: string, opacity: number = 1): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Parses color string and returns rgba format
 */
function parseColor(color: string, opacity: number = 1): string {
  if (!color || typeof color !== 'string') {
    return `rgba(0, 0, 0, ${opacity})`;
  }
  
  // Handle named colors
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    // Add more as needed
  };
  
  const lowerColor = color.toLowerCase();
  if (namedColors[lowerColor]) {
    return hexToRgba(namedColors[lowerColor], opacity);
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity);
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    // If it's already rgba, update the opacity
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${opacity})`);
    }
    // Convert rgb to rgba
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  // Default fallback
  return `rgba(0, 0, 0, ${opacity})`;
}

/**
 * Converts iOS shadow properties to CSS boxShadow
 */
function convertShadowToBoxShadow(style: Style & ShadowStyleIOS): string | undefined {
  const {
    shadowColor = '#000000',
    shadowOffset = { width: 0, height: 0 },
    shadowOpacity = 0,
    shadowRadius = 0,
  } = style;
  
  // If no shadow properties are set, return undefined
  if (shadowOpacity === 0 || (!shadowOffset.width && !shadowOffset.height && shadowRadius === 0)) {
    return undefined;
  }
  
  // Normalize values
  const offsetX = normalizeNumericValue(shadowOffset.width, -100, 100);
  const offsetY = normalizeNumericValue(shadowOffset.height, -100, 100);
  const blurRadius = normalizeNumericValue(shadowRadius, 0, 100);
  const opacity = normalizeOpacity(shadowOpacity);
  
  // Parse color and create rgba string
  const rgbaColor = parseColor(shadowColor, opacity);
  
  // CSS box-shadow format: offsetX offsetY blurRadius spread color
  return `${offsetX}px ${offsetY}px ${blurRadius}px 0px ${rgbaColor}`;
}

/**
 * Converts Android elevation to CSS boxShadow
 * Based on Material Design elevation shadows
 */
function convertElevationToBoxShadow(elevation: number): string | undefined {
  if (!elevation || elevation <= 0) return undefined;
  
  // Normalize elevation
  const normalizedElevation = normalizeNumericValue(elevation, 0, 24);
  
  // Material Design-inspired shadow values
  const shadowMaps: Record<number, string> = {
    1: '0px 1px 3px 0px rgba(0, 0, 0, 0.2)',
    2: '0px 2px 4px 0px rgba(0, 0, 0, 0.15)',
    3: '0px 3px 6px 0px rgba(0, 0, 0, 0.15)',
    4: '0px 4px 8px 0px rgba(0, 0, 0, 0.15)',
    5: '0px 5px 10px 0px rgba(0, 0, 0, 0.15)',
    6: '0px 6px 12px 0px rgba(0, 0, 0, 0.15)',
    8: '0px 8px 16px 0px rgba(0, 0, 0, 0.15)',
    10: '0px 10px 20px 0px rgba(0, 0, 0, 0.15)',
    12: '0px 12px 24px 0px rgba(0, 0, 0, 0.15)',
    16: '0px 16px 32px 0px rgba(0, 0, 0, 0.15)',
    20: '0px 20px 40px 0px rgba(0, 0, 0, 0.15)',
    24: '0px 24px 48px 0px rgba(0, 0, 0, 0.15)',
  };
  
  // Find the closest elevation value
  const elevationKeys = Object.keys(shadowMaps).map(Number).sort((a, b) => a - b);
  let closestElevation = elevationKeys[0];
  
  for (const key of elevationKeys) {
    if (key <= normalizedElevation) {
      closestElevation = key;
    } else {
      break;
    }
  }
  
  return shadowMaps[closestElevation];
}

/**
 * Normalizes a single style object
 */
function normalizeStyleObject(style: Style): Style {
  if (!style || typeof style !== 'object') return style;
  
  const normalized: any = { ...style };
  
  // Normalize opacity
  if ('opacity' in normalized && normalized.opacity !== undefined) {
    normalized.opacity = normalizeOpacity(normalized.opacity);
  }
  
  // Handle shadow conversion for web platform
  if (Platform.OS === 'web') {
    // Check if we have iOS shadow properties
    const hasShadowProps = 'shadowColor' in normalized || 
                          'shadowOffset' in normalized || 
                          'shadowOpacity' in normalized || 
                          'shadowRadius' in normalized;
    
    if (hasShadowProps) {
      // Convert iOS shadow to boxShadow
      const boxShadow = convertShadowToBoxShadow(normalized);
      if (boxShadow) {
        normalized.boxShadow = boxShadow;
        // Remove deprecated shadow properties for web
        delete normalized.shadowColor;
        delete normalized.shadowOffset;
        delete normalized.shadowOpacity;
        delete normalized.shadowRadius;
      }
    }
    
    // Convert elevation to boxShadow if no iOS shadow is present
    if ('elevation' in normalized && normalized.elevation !== undefined && !normalized.boxShadow) {
      const boxShadow = convertElevationToBoxShadow(normalized.elevation);
      if (boxShadow) {
        normalized.boxShadow = boxShadow;
      }
      // Remove elevation for web (it's Android-only)
      delete normalized.elevation;
    }
  } else {
    // For native platforms, just normalize the values
    if ('elevation' in normalized && normalized.elevation !== undefined) {
      normalized.elevation = normalizeNumericValue(normalized.elevation, 0, 24);
    }
    
    if ('shadowOpacity' in normalized && normalized.shadowOpacity !== undefined) {
      normalized.shadowOpacity = normalizeOpacity(normalized.shadowOpacity);
    }
    
    if ('shadowRadius' in normalized && normalized.shadowRadius !== undefined) {
      normalized.shadowRadius = normalizeNumericValue(normalized.shadowRadius, 0, 100);
    }
  }
  
  // Normalize borderRadius values
  const borderRadiusProps = [
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ];
  
  borderRadiusProps.forEach(prop => {
    if (prop in normalized && normalized[prop] !== undefined) {
      normalized[prop] = normalizeNumericValue(normalized[prop], 0, 1000);
    }
  });
  
  // Normalize flex values
  if ('flex' in normalized && normalized.flex !== undefined) {
    normalized.flex = normalizeNumericValue(normalized.flex, 0, 100);
  }
  
  // Normalize zIndex
  if ('zIndex' in normalized && normalized.zIndex !== undefined) {
    normalized.zIndex = Math.floor(normalizeNumericValue(normalized.zIndex, -999999, 999999));
  }
  
  return normalized;
}

/**
 * Normalizes style props to prevent React Native Web errors
 * Handles single styles, arrays of styles, and falsy values
 */
export function normalizeStyle(style: StyleProp): StyleProp {
  if (!style) return style;
  
  if (Array.isArray(style)) {
    return style.map(s => {
      if (!s) return s;
      return normalizeStyleObject(s as Style);
    });
  }
  
  return normalizeStyleObject(style as Style);
}

/**
 * HOC to wrap animated values and ensure they're normalized
 */
export function createNormalizedAnimatedStyle(createStyle: () => any): any {
  const style = createStyle();
  
  // If it's a function (for animated styles), wrap it
  if (typeof style === 'function') {
    return (animatedValues: any) => {
      const computedStyle = style(animatedValues);
      return normalizeStyleObject(computedStyle);
    };
  }
  
  return normalizeStyleObject(style);
}

/**
 * Debug helper to log style normalization issues
 */
export function debugStyleIssues(componentName: string, style: StyleProp): void {
  if (__DEV__ && style) {
    const checkStyle = (s: Style) => {
      if ('opacity' in s && s.opacity !== undefined) {
        const opacity = s.opacity as any;
        if (typeof opacity !== 'number' || opacity < 0 || opacity > 1 || isNaN(opacity)) {
          console.warn(`[Style Warning] ${componentName}: Invalid opacity value:`, opacity);
        }
      }
      
      // Check for deprecated shadow props on web
      if (Platform.OS === 'web') {
        const shadowProps = ['shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius'];
        const hasShadowProps = shadowProps.some(prop => prop in s);
        if (hasShadowProps) {
          console.warn(`[Style Warning] ${componentName}: Using deprecated shadow* props on web. These will be converted to boxShadow.`);
        }
      }
    };
    
    if (Array.isArray(style)) {
      style.forEach(s => s && checkStyle(s as Style));
    } else {
      checkStyle(style as Style);
    }
  }
}

/**
 * Creates a shadow style object that works across all platforms
 * On web, it returns boxShadow; on native platforms, it returns shadow* props
 */
export function createShadowStyle(
  shadowColor: string = '#000000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 2 },
  shadowOpacity: number = 0.25,
  shadowRadius: number = 4,
  elevation: number = 5
): ViewStyle {
  if (Platform.OS === 'web') {
    const color = parseColor(shadowColor, shadowOpacity);
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px 0px ${color}`,
    };
  } else if (Platform.OS === 'android') {
    return { elevation };
  } else {
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
    };
  }
}

/**
 * Convenience function to create elevation-based shadows
 * Works across all platforms
 */
export function createElevationStyle(elevation: number): ViewStyle {
  if (Platform.OS === 'web') {
    const boxShadow = convertElevationToBoxShadow(elevation);
    return boxShadow ? { boxShadow } : {};
  } else if (Platform.OS === 'android') {
    return { elevation };
  } else {
    // iOS equivalent shadows based on elevation
    const shadowMap: Record<number, ShadowStyleIOS> = {
      1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1 },
      2: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
      3: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
      4: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.23, shadowRadius: 2.62 },
      5: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
      6: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.27, shadowRadius: 4.65 },
      8: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
      10: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5.46 },
      12: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 6.68 },
      16: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10.0 },
      20: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 13.16 },
      24: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 17.49 },
    };
    
    // Find closest elevation
    const elevations = Object.keys(shadowMap).map(Number).sort((a, b) => a - b);
    let closest = elevations[0];
    for (const e of elevations) {
      if (e <= elevation) closest = e;
      else break;
    }
    
    return shadowMap[closest] || {};
  }
}