import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { Discount } from '@/types/discount';

interface DiscountDealCardProps {
  discount: Discount;
  onPress: (id: string) => void;
}

function formatPrice(price: number): string {
  return `${price.toFixed(2)} ₺`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

function DiscountDealCardComponent({ discount, onPress }: DiscountDealCardProps) {
  const savingsText = useMemo(
    () => formatPrice(discount.originalPrice - discount.discountedPrice),
    [discount.discountedPrice, discount.originalPrice],
  );

  const validUntilText = useMemo(
    () => formatDate(discount.validUntil),
    [discount.validUntil],
  );

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(discount.id)}
      accessibilityRole="button"
      accessibilityLabel={`${discount.productName}, yüzde ${discount.discountPercent} indirim`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: discount.imageUrl }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>%{discount.discountPercent}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.product} numberOfLines={2}>
          {discount.productName}
        </Text>
        <View style={styles.priceBlock}>
          <Text style={styles.originalPrice}>{formatPrice(discount.originalPrice)}</Text>
          <Text style={styles.discountedPrice}>{formatPrice(discount.discountedPrice)}</Text>
        </View>
        <Text style={styles.savings}>{savingsText} tasarruf</Text>
        <Text style={styles.validUntil}>Son {validUntilText}</Text>
      </View>
    </Pressable>
  );
}

export const DiscountDealCard = memo(DiscountDealCardComponent);

const CARD_WIDTH = 156;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  imageWrap: {
    height: 108,
    backgroundColor: colors.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  discountBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '800',
  },
  body: {
    padding: spacing.sm,
    paddingTop: spacing.sm + 2,
  },
  product: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: spacing.xs,
  },
  priceBlock: {
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 11,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  savings: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 2,
  },
  validUntil: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

export const DISCOUNT_DEAL_CARD_WIDTH = CARD_WIDTH;
