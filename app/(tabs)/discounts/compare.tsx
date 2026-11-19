import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComparisonRow } from '@/components/discounts/ComparisonRow';
import { DiscountDealsByStore } from '@/components/discounts/DiscountDealsByStore';
import { useApp } from '@/context/AppContext';
import { useApiData } from '@/hooks/useApiData';
import { fetchDiscounts } from '@/services/api/catalogApi';
import { fetchProducts } from '@/services/api/trackingApi';
import { colors, spacing } from '@/theme';
import type { Discount } from '@/types/discount';
import type { ComparisonProduct } from '@/types/tracking';

export default function CompareScreen() {
  const router = useRouter();
  const { trackedProducts, toggleFavorite } = useApp();
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useApiData<ComparisonProduct[]>([], fetchProducts);
  const {
    data: discounts,
    isLoading: discountsLoading,
    error: discountsError,
  } = useApiData<Discount[]>([], fetchDiscounts);

  const isLoading = productsLoading || discountsLoading;
  const error = productsError ?? discountsError;

  const favoriteMap = useMemo(
    () => new Map(trackedProducts.map((product) => [product.id, product.isFavorite])),
    [trackedProducts],
  );

  const handleToggleFavorite = useCallback(
    (productId: string) => {
      void toggleFavorite(productId);
    },
    [toggleFavorite],
  );

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/discounts/product/${productId}` as Href);
    },
    [router],
  );

  const handleDiscountPress = useCallback(
    (id: string) => {
      router.push(`/discounts/discount/${id}` as Href);
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>
          Temel ihtiyaç ürünlerinin 4 büyük marketteki güncel fiyatları ile şu an indirimde olan ürünleri birlikte görün. Kalp ikonuyla favoriye ekleyin, en uygun fiyat yeşil ile işaretlenir.
        </Text>

        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temel Ürünler</Text>
          <Text style={styles.sectionHint}>
            Süt, zeytinyağı, deterjan gibi sık alınan temel ihtiyaçların market fiyat karşılaştırması.
          </Text>
          {products.map((product) => (
            <ComparisonRow
              key={product.id}
              product={product}
              isFavorite={favoriteMap.get(product.id) ?? false}
              onToggleFavorite={handleToggleFavorite}
              onPress={handleProductPress}
            />
          ))}
          {!productsLoading && products.length === 0 ? (
            <Text style={styles.emptyText}>Temel ürün bulunamadı.</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şu An İndirimde Olan Ürünler</Text>
          <Text style={styles.sectionHint}>
            Aktif indirimler marketlere göre gruplandı.
          </Text>
          {!discountsLoading ? (
            <DiscountDealsByStore discounts={discounts} onPress={handleDiscountPress} />
          ) : null}
        </View>
      </ScrollView>
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
  loader: {
    marginBottom: spacing.md,
  },
  error: {
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
});
