import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/theme';

interface IngredientChipProps {
  id: string;
  name: string;
  emoji: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

function IngredientChipComponent({
  id,
  name,
  emoji,
  isSelected,
  onToggle,
}: IngredientChipProps) {
  const handlePress = () => {
    onToggle(id);
  };

  return (
    <Pressable
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={name}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{name}</Text>
    </Pressable>
  );
}

export const IngredientChip = memo(IngredientChipComponent);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  emoji: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  labelSelected: {
    color: colors.surface,
  },
});
