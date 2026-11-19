import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, radius, shadows, spacing } from '@/theme';
import type { Discount } from '@/types/discount';

interface DiscountCardProps {
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
    month: 'long',
  });
}

function DiscountCardComponent({ discount, onPress }: DiscountCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const savingsText = useMemo(
    () => formatPrice(discount.originalPrice - discount.discountedPrice),
    [discount.discountedPrice, discount.originalPrice],
  );

  const validUntilText = useMemo(
    () => formatDate(discount.validUntil),
    [discount.validUntil],
  );

  const handlePress = () => {
    onPress(discount.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${discount.productName} indirimi`}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          source={{ uri: discount.imageUrl }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.store}>{discount.storeName}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>%{discount.discountPercent}</Text>
            </View>
          </View>
          <Text style={styles.product} numberOfLines={2}>
            {discount.productName}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>{formatPrice(discount.originalPrice)}</Text>
            <Text style={styles.discountedPrice}>{formatPrice(discount.discountedPrice)}</Text>
          </View>
          <Text style={styles.savings}>{savingsText} tasarruf</Text>
          <Text style={styles.validUntil}>Son: {validUntilText}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export const DiscountCard = memo(DiscountCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  image: {
    width: 104,
    height: 124,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  store: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  discountBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  product: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  originalPrice: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent,
  },
  savings: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  validUntil: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
