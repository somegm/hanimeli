import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';
import { colors, radius, shadows, spacing } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface FeatureCardProps {
  title: string;
  description: string;
  icon: IoniconName;
  iconColor: ColorValue;
  onPress: () => void;
  index?: number;
}

function FeatureCardComponent({
  title,
  description,
  icon,
  iconColor,
  onPress,
  index = 0,
}: FeatureCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedFadeIn index={index}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
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
            <View style={[styles.iconWrap, { backgroundColor: `${String(iconColor)}18` }]}>
              <Ionicons name={icon} size={22} color={iconColor} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            </View>
            <View style={styles.chevronWrap}>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </AnimatedFadeIn>
  );
}

export const FeatureCard = memo(FeatureCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
