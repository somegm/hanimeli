import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, radius, shadows } from '@/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function GlassCardComponent({ children, style }: GlassCardProps) {
  return <Animated.View style={[styles.card, style]}>{children}</Animated.View>;
}

interface PressableGlassCardProps extends GlassCardProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

function PressableGlassCardComponent({
  children,
  style,
  onPress,
  accessibilityLabel,
}: PressableGlassCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.card, style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

export const GlassCard = memo(GlassCardComponent);
export const PressableGlassCard = memo(PressableGlassCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.sm,
  },
});
