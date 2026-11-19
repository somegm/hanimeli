import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@/theme';
import type { ShoppingListItem } from '@/types/shopping';

interface ListItemRowProps {
  item: ShoppingListItem;
  onToggle: (itemId: string) => void;
}

function ListItemRowComponent({ item, onToggle }: ListItemRowProps) {
  const handleToggle = () => {
    onToggle(item.id);
  };

  return (
    <Pressable style={styles.row} onPress={handleToggle} accessibilityRole="checkbox">
      <Ionicons
        name={item.isChecked ? 'checkbox' : 'square-outline'}
        size={24}
        color={item.isChecked ? colors.success : colors.textSecondary}
      />
      <View style={styles.content}>
        <Text style={[styles.name, item.isChecked && styles.checkedName]}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.quantity} · {item.addedBy}
        </Text>
      </View>
    </Pressable>
  );
}

export const ListItemRow = memo(ListItemRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  checkedName: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
