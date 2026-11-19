import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';
import { colors, spacing } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  large?: boolean;
}

function ScreenHeaderComponent({ title, subtitle, large = false }: ScreenHeaderProps) {
  return (
    <AnimatedFadeIn direction="up" index={0}>
      <View style={styles.container}>
        <Text style={[styles.title, large && styles.titleLarge]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.accentLine} />
      </View>
    </AnimatedFadeIn>
  );
}

export const ScreenHeader = memo(ScreenHeaderComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  accentLine: {
    marginTop: spacing.md,
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
