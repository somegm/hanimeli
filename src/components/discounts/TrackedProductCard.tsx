import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { TrackedProduct } from '@/types/tracking';

interface TrackedProductCardProps {
  product: TrackedProduct;
  onToggleFavorite: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onSimulateDrop: (id: string) => void;
}

function TrackedProductCardComponent({
  product,
  onToggleFavorite,
  onToggleAlert,
  onSimulateDrop,
}: TrackedProductCardProps) {
  const isBelowTarget = useMemo(
    () => product.currentPrice <= product.targetPrice,
    [product.currentPrice, product.targetPrice],
  );

  const handleToggleFavorite = () => {
    onToggleFavorite(product.id);
  };

  const handleToggle = () => {
    onToggleAlert(product.id);
  };

  const handleSimulate = () => {
    onSimulateDrop(product.id);
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{product.productName}</Text>
          <Pressable onPress={handleToggleFavorite} accessibilityRole="button">
            <Ionicons
              name={product.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={product.isFavorite ? colors.accent : colors.textSecondary}
            />
          </Pressable>
        </View>
        <Text style={styles.store}>{product.storeName}</Text>
        <Text style={styles.price}>{product.currentPrice.toFixed(2)} ₺</Text>
        <Text style={styles.target}>
          Hedef: {product.targetPrice.toFixed(2)} ₺
          {isBelowTarget ? ' ✓' : ''}
        </Text>

        <View style={styles.alertRow}>
          <Text style={styles.alertLabel}>Fiyat alarmı</Text>
          <Switch
            value={product.alertEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <Pressable style={styles.simulateBtn} onPress={handleSimulate}>
          <Text style={styles.simulateText}>Fiyat düşüşünü test et</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const TrackedProductCard = memo(TrackedProductCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 90,
    height: 140,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  store: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  target: {
    fontSize: 13,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertLabel: {
    fontSize: 14,
    color: colors.text,
  },
  simulateBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  simulateText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
