/**
 * Central export point for utility functions
 */

// Receipt helpers
export { 
  normalizeReceipt, 
  formatCurrency, 
  parseAmount 
} from './receiptHelpers';

// Development helpers
export { 
  testSafeToFixed,
  testReceiptAmountHandling,
  createTestReceipts,
  debugReceipt
} from './developmentHelpers';

// Safe number formatting
export {
  safeToFixed
} from './safeToFixed';

// Style normalization helpers
export {
  normalizeStyle,
  createNormalizedAnimatedStyle,
  debugStyleIssues,
  createShadowStyle,
  createElevationStyle
} from './styleNormalizer';

// Animation helpers for web compatibility
export {
  safeInterpolate,
  createSafeOpacityValue,
  animateOpacity,
  getAnimationConfig,
  normalizePointerEvents,
  AnimationConfigs,
  createTimingConfig,
  createSpringConfig,
  debugAnimationWarning
} from './animatedStyleHelpers';

// Re-export types if needed
export type { Receipt } from '../contexts/ReceiptContext';