import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface LogoProps {
  size?: number;
  /** Gentle breathing animation — used for the splash mark and the
   * "AI is thinking" typing indicator. Off by default (e.g. the
   * small avatar next to every AI message stays still). */
  pulsing?: boolean;
  style?: ViewStyle;
}

export function Logo({ size = 64, pulsing = false, style }: LogoProps) {
  const reducedMotion = useReducedMotion();
  const animate = pulsing && !reducedMotion;

  const scale = useSharedValue(1);
  const glow = useSharedValue(0.35);

  useEffect(() => {
    if (animate) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(0.65, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 250 });
      glow.value = withTiming(0.35, { duration: 250 });
    }
  }, [animate, scale, glow]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowProps = useAnimatedProps(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="grexOrbGradient" cx="35%" cy="30%" r="75%">
            <Stop offset="0%" stopColor="#C4B5FD" />
            <Stop offset="55%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#5B21B6" />
          </RadialGradient>
          <RadialGradient id="grexOrbGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <AnimatedCircle cx="50" cy="50" r="50" fill="url(#grexOrbGlow)" animatedProps={glowProps} />
        <Circle cx="50" cy="50" r="41" fill="url(#grexOrbGradient)" />
      </Svg>
    </Animated.View>
  );
}

/** Non-animated 1:1 export for contexts that just need a plain mark
 * (e.g. a list-row avatar rendered many times in a FlatList, where a
 * live Reanimated tree per row would be wasteful). */
export function StaticLogoDot({ size = 28 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="grexOrbGradientStatic" cx="35%" cy="30%" r="75%">
            <Stop offset="0%" stopColor="#C4B5FD" />
            <Stop offset="55%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#5B21B6" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="46" fill="url(#grexOrbGradientStatic)" />
      </Svg>
    </View>
  );
}
