import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DiscountStoreSection } from '@/components/discounts/DiscountStoreSection';
import { groupDiscountsByStore } from '@/constants/storeBranding';
import { colors, spacing } from '@/theme';
import type { Discount } from '@/types/discount';

interface DiscountDealsByStoreProps {
  discounts: Discount[];
  onPress: (id: string) => void;
  emptyText?: string;
}

function DiscountDealsByStoreComponent({
  discounts,
  onPress,
  emptyText = 'Şu an indirimde ürün bulunamadı.',
}: DiscountDealsByStoreProps) {
  const groups = useMemo(() => groupDiscountsByStore(discounts), [discounts]);

  if (groups.length === 0) {
    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <DiscountStoreSection key={group.storeKey} group={group} onPress={onPress} />
      ))}
    </View>
  );
}

export const DiscountDealsByStore = memo(DiscountDealsByStoreComponent);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
});
