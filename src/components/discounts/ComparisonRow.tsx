import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { ComparisonProduct } from '@/types/tracking';

interface ComparisonRowProps {
  product: ComparisonProduct;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onPress?: (productId: string) => void;
}

const STORE_ORDER = ['BIM', 'Şok', 'A101', 'Migros'] as const;

function ComparisonRowComponent({
  product,
  isFavorite,
  onToggleFavorite,
  onPress,
}: ComparisonRowProps) {
  const sortedPrices = useMemo(
    () =>
      [...product.prices].sort(
        (a, b) =>
          STORE_ORDER.indexOf(a.storeName) - STORE_ORDER.indexOf(b.storeName),
      ),
    [product.prices],
  );

  const cheapestPrice = useMemo(
    () => Math.min(...product.prices.map((p) => p.price)),
    [product.prices],
  );

  const handleFavoritePress = () => {
    onToggleFavorite(product.id);
  };

  const handleCardPress = () => {
    onPress?.(product.id);
  };

  return (
    <Pressable style={styles.card} onPress={handleCardPress} disabled={!onPress}>
      <View style={styles.header}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>{product.productName}</Text>
          <Text style={styles.unit}>{product.unit}</Text>
        </View>
        <Pressable
          onPress={handleFavoritePress}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
          style={styles.favoriteBtn}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.accent : colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.priceGrid}>
        {sortedPrices.map((storePrice) => {
          const isCheapest = storePrice.price === cheapestPrice && storePrice.inStock;
          return (
            <View
              key={storePrice.storeName}
              style={[styles.priceCell, isCheapest && styles.cheapestCell]}
            >
              <Text style={styles.storeName}>{storePrice.storeName}</Text>
              <Text style={[styles.price, isCheapest && styles.cheapestPrice]}>
                {storePrice.inStock ? `${storePrice.price.toFixed(2)} ₺` : 'Stok yok'}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

export const ComparisonRow = memo(ComparisonRowComponent);

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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  unit: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  favoriteBtn: {
    padding: spacing.xs,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priceCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    alignItems: 'center',
  },
  cheapestCell: {
    backgroundColor: colors.successMuted,
    borderWidth: 1,
    borderColor: colors.success,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cheapestPrice: {
    color: colors.success,
  },
});
