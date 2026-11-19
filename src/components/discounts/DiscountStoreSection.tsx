import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiscountDealCard } from '@/components/discounts/DiscountDealCard';
import type { DiscountStoreGroup } from '@/constants/storeBranding';
import { spacing } from '@/theme';
import type { Discount } from '@/types/discount';

interface DiscountStoreSectionProps {
  group: DiscountStoreGroup;
  onPress: (id: string) => void;
}

function DiscountStoreSectionComponent({ group, onPress }: DiscountStoreSectionProps) {
  const { brand, items } = group;

  return (
    <View style={styles.section}>
      <View style={[styles.header, { backgroundColor: brand.lightBg }]}>
        <View style={[styles.storePill, { backgroundColor: brand.color }]}>
          <Text style={[styles.storeLabel, { color: brand.textColor }]}>{brand.label}</Text>
        </View>
        <Text style={styles.dealCount}>
          {items.length} fırsat
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
      >
        {items.map((discount: Discount) => (
          <DiscountDealCard key={discount.id} discount={discount} onPress={onPress} />
        ))}
      </ScrollView>
    </View>
  );
}

export const DiscountStoreSection = memo(DiscountStoreSectionComponent);

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  storePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  storeLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dealCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4037',
  },
  row: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
