import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import type { ColorValue } from 'react-native';

import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';
import { colors, radius, spacing } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface StatWidgetProps {
  title: string;
  value: string;
  icon: IoniconName;
  accentColor: ColorValue;
  onPress: () => void;
  index?: number;
}

function StatWidgetComponent({
  title,
  value,
  icon,
  accentColor,
  onPress,
  index = 0,
}: StatWidgetProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedFadeIn index={index}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 15, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <LinearGradient
            colors={[colors.surfaceHighlight, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${String(accentColor)}22` }]}>
              <Ionicons name={icon} size={20} color={accentColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value} numberOfLines={2}>
              {value}
            </Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </AnimatedFadeIn>
  );
}

export const StatWidget = memo(StatWidgetComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  gradient: {
    padding: spacing.md,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 19,
  },
});
