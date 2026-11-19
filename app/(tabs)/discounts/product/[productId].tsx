import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppContext';
import { fetchProductDetail } from '@/services/api/catalogApi';
import { getStoreBrand } from '@/constants/storeBranding';
import { colors, spacing } from '@/theme';
import type { ProductDetail } from '@/types/product';

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { trackedProducts, toggleFavorite, togglePriceAlert } = useApp();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tracked = trackedProducts.find((p) => p.id === productId);

  useEffect(() => {
    if (!productId) {
      return;
    }
    void fetchProductDetail(productId)
      .then((data) => {
        setProduct(data);
        setError(null);
      })
      .catch(() => setError('Ürün yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleToggleFavorite = useCallback(() => {
    if (!productId) {
      return;
    }
    void toggleFavorite(productId);
  }, [productId, toggleFavorite]);

  const handleToggleAlert = useCallback(() => {
    if (!productId) {
      return;
    }
    void togglePriceAlert(productId);
  }, [productId, togglePriceAlert]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Ürün bulunamadı'}</Text>
      </SafeAreaView>
    );
  }

  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
  const cheapestPrice = sortedPrices[0]?.price;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{product.productName}</Text>
          <Pressable onPress={handleToggleFavorite}>
            <Ionicons
              name={tracked?.isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={tracked?.isFavorite ? colors.accent : colors.textSecondary}
            />
          </Pressable>
        </View>
        <Text style={styles.meta}>{product.category} · {product.unit}</Text>

        <Text style={styles.sectionTitle}>Market Fiyatları</Text>
        {sortedPrices.map((price) => {
          const branding = getStoreBrand(price.storeName);
          const isCheapest = price.price === cheapestPrice;
          return (
            <View key={price.storeName} style={[styles.priceRow, isCheapest && styles.cheapestRow]}>
              <Text style={[styles.storeName, { color: branding.color }]}>{price.storeName}</Text>
              <Text style={styles.price}>{price.price.toFixed(2)} ₺</Text>
            </View>
          );
        })}

        <Pressable style={styles.alertBtn} onPress={handleToggleAlert}>
          <Ionicons
            name={tracked?.alertEnabled ? 'notifications' : 'notifications-outline'}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.alertText}>
            {tracked?.alertEnabled ? 'Fiyat alarmı açık' : 'Fiyat alarmı kur'}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Fiyat Geçmişi (30 gün)</Text>
        {Object.entries(product.priceHistory).map(([store, history]) => (
          <View key={store} style={styles.historyBlock}>
            <Text style={styles.historyStore}>{store}</Text>
            {history.length === 0 ? (
              <Text style={styles.historyEmpty}>Henüz geçmiş veri yok</Text>
            ) : (
              history.slice(-5).map((point) => (
                <Text key={`${store}-${point.date}`} style={styles.historyPoint}>
                  {point.date}: {point.price.toFixed(2)} ₺
                </Text>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.md },
  image: { width: '100%', height: 180, borderRadius: 16, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text },
  meta: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cheapestRow: { borderColor: colors.success, backgroundColor: colors.successMuted },
  storeName: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '700', color: colors.text },
  alertBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12 },
  alertText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  historyBlock: { marginBottom: spacing.md },
  historyStore: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  historyPoint: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  historyEmpty: { fontSize: 14, color: colors.textSecondary },
  error: { color: colors.accent },
});
