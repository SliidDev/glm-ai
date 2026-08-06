import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Respects the OS-level "reduce motion" accessibility setting —
 * splash/onboarding animations and the typing-indicator pulse all
 * check this and fall back to a static equivalent when it's on. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
