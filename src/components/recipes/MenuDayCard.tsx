import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { DayMenu } from '@/types/menu';

interface MenuDayCardProps {
  dayMenu: DayMenu;
}

function MenuDayCardComponent({ dayMenu }: MenuDayCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.day}>{dayMenu.dayLabel}</Text>
      <View style={styles.mealRow}>
        <Text style={styles.mealLabel}>Kahvaltı</Text>
        <Text style={styles.mealValue}>{dayMenu.breakfast}</Text>
      </View>
      <View style={styles.mealRow}>
        <Text style={styles.mealLabel}>Öğle</Text>
        <Text style={styles.mealValue}>{dayMenu.lunch}</Text>
      </View>
      <View style={styles.mealRow}>
        <Text style={styles.mealLabel}>Akşam</Text>
        <Text style={styles.mealValue}>{dayMenu.dinner}</Text>
      </View>
    </View>
  );
}

export const MenuDayCard = memo(MenuDayCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  day: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  mealRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  mealLabel: {
    width: 70,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mealValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
