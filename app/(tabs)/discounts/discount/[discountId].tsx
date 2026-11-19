import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchDiscountDetail } from '@/services/api/catalogApi';
import { getStoreBrand } from '@/constants/storeBranding';
import { colors, spacing } from '@/theme';
import type { Discount } from '@/types/discount';

export default function DiscountDetailScreen() {
  const { discountId } = useLocalSearchParams<{ discountId: string }>();
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!discountId) {
      return;
    }
    void fetchDiscountDetail(discountId)
      .then((data) => {
        setDiscount(data);
        setError(null);
      })
      .catch(() => setError('İndirim yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [discountId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !discount) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error ?? 'İndirim bulunamadı'}</Text>
      </SafeAreaView>
    );
  }

  const branding = getStoreBrand(discount.storeName);
  const savings = discount.originalPrice - discount.discountedPrice;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: discount.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={[styles.badge, { backgroundColor: branding.color }]}>
          <Text style={styles.badgeText}>{discount.storeName}</Text>
        </View>
        <Text style={styles.title}>{discount.productName}</Text>
        <Text style={styles.category}>{discount.category}</Text>

        <View style={styles.priceBox}>
          <Text style={styles.oldPrice}>{discount.originalPrice.toFixed(2)} ₺</Text>
          <Text style={styles.newPrice}>{discount.discountedPrice.toFixed(2)} ₺</Text>
          <Text style={styles.discount}>%{discount.discountPercent} indirim</Text>
          <Text style={styles.savings}>{savings.toFixed(2)} ₺ tasarruf</Text>
        </View>

        <Text style={styles.valid}>Geçerlilik: {discount.validUntil}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.md },
  image: { width: '100%', height: 200, borderRadius: 16, marginBottom: spacing.md },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8, marginBottom: spacing.sm },
  badgeText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  category: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  priceBox: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  oldPrice: { fontSize: 16, color: colors.textSecondary, textDecorationLine: 'line-through' },
  newPrice: { fontSize: 28, fontWeight: '700', color: colors.success, marginTop: spacing.xs },
  discount: { fontSize: 16, fontWeight: '600', color: colors.accent, marginTop: spacing.sm },
  savings: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  valid: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.lg },
  error: { color: colors.accent },
});
