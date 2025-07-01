/**
 * Patches for React Native Web style issues
 * Fixes toFixed errors in color and opacity normalization
 */

import { Platform } from 'react-native';
import { safeToFixed, setOriginalToFixed } from './safeToFixed';

// Track patch state
let patchesApplied = false;
let originalToFixed: typeof Number.prototype.toFixed | null = null;

/**
 * Apply web-specific style patches
 * Call this once at app startup before React Native Web initializes
 */
export function applyWebStylePatches() {
  if (Platform.OS !== 'web' || patchesApplied) return;

  // Apply patches in both development and production to prevent errors
  patchNumberPrototype();
  
  // Additional development-only patches
  if (__DEV__) {
    patchConsoleWarnings();
    setupDevelopmentErrorTracking();
  }
  
  patchesApplied = true;
  
  if (__DEV__) {
    console.log('[WebStylePatches] React Native Web style patches applied successfully');
  }
}

/**
 * Initialize web-specific style patches (alias for applyWebStylePatches)
 * @deprecated Use applyWebStylePatches instead
 */
export function initializeWebStylePatches() {
  applyWebStylePatches();
}

/**
 * Remove web style patches (useful for testing)
 */
export function removeWebStylePatches() {
  if (!patchesApplied || !originalToFixed) return;
  
  Number.prototype.toFixed = originalToFixed;
  setOriginalToFixed(null as any); // Clear the reference in safeToFixed
  patchesApplied = false;
  
  if (__DEV__) {
    console.log('[WebStylePatches] React Native Web style patches removed');
  }
}

/**
 * Patches Number.prototype to handle invalid toFixed calls gracefully
 */
function patchNumberPrototype() {
  // Prevent double-patching
  if ((Number.prototype.toFixed as any).__patched) {
    if (__DEV__) {
      console.warn('[WebStylePatches] toFixed is already patched, skipping');
    }
    return;
  }
  
  // Store original function
  originalToFixed = Number.prototype.toFixed;
  
  // Set the original in safeToFixed to avoid recursion
  setOriginalToFixed(originalToFixed);

  Number.prototype.toFixed = function(fractionDigits?: number) {
    try {
      // Use our robust safeToFixed utility
      // This handles Number objects, invalid values, and edge cases
      const result = safeToFixed(this, fractionDigits ?? 0);
      
      // No need to log warnings here since safeToFixed already handles logging
      // Just return the safe result
      return result;
    } catch (error) {
      if (__DEV__) {
        console.error('[toFixed Patch] Unexpected error in patched toFixed:', error);
      }
      // Fallback to safe default
      return '0';
    }
  };
  
  // Mark the function as patched for debugging
  (Number.prototype.toFixed as any).__patched = true;
}

/**
 * Extract caller information from stack trace
 */
function extractCallerInfo(stack?: string): string {
  if (!stack) return 'Unknown';
  
  const lines = stack.split('\n');
  // Skip first two lines (Error and current function)
  for (let i = 2; i < lines.length && i < 5; i++) {
    const line = lines[i];
    // Skip our patch functions
    if (!line.includes('webStylePatches') && !line.includes('safeToFixed')) {
      // Extract function name and location
      const match = line.match(/at\s+(\S+)\s+\((.+)\)/);
      if (match) {
        return `${match[1]} (${match[2]})`;
      }
      // Handle direct calls without function name
      const directMatch = line.match(/at\s+(.+)/);
      if (directMatch) {
        return directMatch[1];
      }
    }
  }
  return 'Unknown caller';
}

/**
 * Setup development error tracking for toFixed issues
 */
function setupDevelopmentErrorTracking() {
  // Track toFixed errors
  const errorCounts = new Map<string, number>();
  
  // Override console.error to detect specific patterns
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const message = args[0]?.toString() || '';
    
    // Check for toFixed-related errors
    if (message.includes('toFixed') || message.includes('is not a function')) {
      const stack = new Error().stack;
      const caller = extractCallerInfo(stack);
      
      // Track error frequency
      const key = `${message.substring(0, 100)}|${caller}`;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
      
      // Provide helpful context
      console.warn(
        '[toFixed Error Detected]',
        '\n  Message:', message,
        '\n  Location:', caller,
        '\n  Occurrences:', errorCounts.get(key),
        '\n  Fix: The toFixed patch should handle this, but check if:',
        '\n    1. Patches were applied before React Native Web initialized',
        '\n    2. The value is a complex object that needs special handling',
        '\n    3. Consider using safeToFixed() directly in your code'
      );
    }
    
    // Call original error
    originalError.apply(console, args);
  };
}

/**
 * Suppresses specific React Native Web warnings in development
 */
function patchConsoleWarnings() {
  const originalWarn = console.warn;
  
  console.warn = function(...args: any[]) {
    const message = args[0]?.toString() || '';
    
    // Suppress specific toFixed warnings that are already handled
    if (message.includes('toFixed called on invalid number') ||
        message.includes('[toFixed Patch]') ||
        message.includes('Invalid numeric value')) {
      // Log to debug instead of warn
      console.debug('[Suppressed Warning]', ...args);
      return;
    }
    
    // Call original warn for other messages
    originalWarn.apply(console, args);
  };
}

/**
 * Normalizes color values for React Native Web
 * Ensures opacity in rgba/hsla values are valid
 */
export function normalizeColorValue(color: any): any {
  if (typeof color !== 'string') return color;
  
  // Handle rgba colors
  const rgbaMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const alpha = a ? Math.max(0, Math.min(1, parseFloat(a))) : 1;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // Handle hex colors with alpha
  const hexAlphaMatch = color.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/i);
  if (hexAlphaMatch) {
    const [, hex, alpha] = hexAlphaMatch;
    const alphaValue = parseInt(alpha, 16) / 255;
    const safeAlpha = Math.max(0, Math.min(1, alphaValue));
    return `#${hex}${Math.round(safeAlpha * 255).toString(16).padStart(2, '0')}`;
  }
  
  return color;
}

/**
 * Wraps style objects to normalize problematic values
 */
export function normalizeWebStyles(styles: any): any {
  if (!styles || typeof styles !== 'object') return styles;
  
  const normalized = { ...styles };
  
  // Normalize opacity
  if ('opacity' in normalized && normalized.opacity != null) {
    const opacity = parseFloat(normalized.opacity);
    if (isNaN(opacity) || !isFinite(opacity)) {
      normalized.opacity = 1;
    } else {
      normalized.opacity = Math.max(0, Math.min(1, opacity));
    }
  }
  
  // Normalize color properties
  const colorProps = ['color', 'backgroundColor', 'borderColor', 'shadowColor', 
                     'tintColor', 'textShadowColor', 'textDecorationColor'];
  
  colorProps.forEach(prop => {
    if (prop in normalized && normalized[prop]) {
      normalized[prop] = normalizeColorValue(normalized[prop]);
    }
  });
  
  return normalized;
}