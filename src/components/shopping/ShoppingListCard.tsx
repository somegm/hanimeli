import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { ShoppingList } from '@/types/shopping';

interface ShoppingListCardProps {
  list: ShoppingList;
  onPress: (id: string) => void;
}

function ShoppingListCardComponent({ list, onPress }: ShoppingListCardProps) {
  const checkedCount = useMemo(
    () => list.items.filter((item) => item.isChecked).length,
    [list.items],
  );

  const handlePress = () => {
    onPress(list.id);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress} accessibilityRole="button">
      <View style={styles.header}>
        <Text style={styles.title}>{list.title}</Text>
        <Text style={styles.progress}>
          {checkedCount}/{list.items.length}
        </Text>
      </View>
      <Text style={styles.shareCode}>Paylaşım kodu: {list.shareCode}</Text>
      <View style={styles.members}>
        {list.members.map((member) => (
          <View
            key={member.id}
            style={[styles.avatar, { backgroundColor: member.avatarColor }]}
          >
            <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
          </View>
        ))}
        <Text style={styles.memberCount}>{list.members.length} kişi</Text>
      </View>
    </Pressable>
  );
}

export const ShoppingListCard = memo(ShoppingListCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  progress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  shareCode: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  members: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  memberCount: {
    marginLeft: spacing.md,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
