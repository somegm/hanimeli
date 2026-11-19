import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { CookingTip } from '@/types/tip';

interface TipCardProps {
  tip: CookingTip;
}

function TipCardComponent({ tip }: TipCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{tip.categoryLabel}</Text>
      </View>
      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.content}>{tip.content}</Text>
    </View>
  );
}

export const TipCard = memo(TipCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
