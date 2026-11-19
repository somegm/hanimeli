import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrackedProductCard } from '@/components/discounts/TrackedProductCard';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';
import type { TrackedProduct } from '@/types/tracking';

type FilterMode = 'favorites' | 'all';

export default function AlertsScreen() {
  const { trackedProducts, toggleFavorite, togglePriceAlert, simulatePriceDrop } = useApp();
  const [filter, setFilter] = useState<FilterMode>('favorites');

  const filteredProducts = useMemo(() => {
    if (filter === 'favorites') {
      return trackedProducts.filter((product) => product.isFavorite);
    }
    return trackedProducts;
  }, [trackedProducts, filter]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      void toggleFavorite(id);
    },
    [toggleFavorite],
  );

  const handleToggleAlert = useCallback(
    (id: string) => {
      void togglePriceAlert(id);
    },
    [togglePriceAlert],
  );

  const handleSimulateDrop = useCallback(
    (id: string) => {
      void simulatePriceDrop(id);
    },
    [simulatePriceDrop],
  );

  const handleFavoritesFilter = useCallback(() => {
    setFilter('favorites');
  }, []);

  const handleAllFilter = useCallback(() => {
    setFilter('all');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TrackedProduct }) => (
      <TrackedProductCard
        product={item}
        onToggleFavorite={handleToggleFavorite}
        onToggleAlert={handleToggleAlert}
        onSimulateDrop={handleSimulateDrop}
      />
    ),
    [handleToggleFavorite, handleToggleAlert, handleSimulateDrop],
  );

  const keyExtractor = useCallback((item: TrackedProduct) => item.id, []);

  const listHeader = useCallback(
    () => (
      <View>
        <Text style={styles.hint}>
          Sık aldığınız ürünleri favoriye ekleyin, fiyat alarmı açın. Hedef fiyata düşünce bildirim alırsınız.
        </Text>
        <View style={styles.filters}>
          <Pressable
            style={[styles.filterChip, filter === 'favorites' && styles.filterChipActive]}
            onPress={handleFavoritesFilter}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === 'favorites' && styles.filterLabelActive,
              ]}
            >
              Favorilerim
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={handleAllFilter}
          >
            <Text
              style={[styles.filterLabel, filter === 'all' && styles.filterLabelActive]}
            >
              Tüm Ürünler
            </Text>
          </Pressable>
        </View>
        {filteredProducts.length === 0 ? (
          <Text style={styles.empty}>
            {filter === 'favorites'
              ? 'Henüz favori ürününüz yok. Market karşılaştırmasından kalp ikonuyla ekleyebilirsiniz.'
              : 'Takip edilecek ürün bulunamadı.'}
          </Text>
        ) : null}
      </View>
    ),
    [filter, filteredProducts.length, handleFavoritesFilter, handleAllFilter],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlashList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterLabelActive: {
    color: colors.surface,
  },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
});
