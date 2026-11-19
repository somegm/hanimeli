import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiscountDealsByStore } from '@/components/discounts/DiscountDealsByStore';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { groupDiscountsByStore } from '@/constants/storeBranding';
import { useApiData } from '@/hooks/useApiData';
import { fetchDiscounts } from '@/services/api/catalogApi';
import { colors, spacing } from '@/theme';
import type { Discount } from '@/types/discount';

export default function DiscountsScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useApiData<Discount[]>([], fetchDiscounts);

  const totalDeals = data.length;
  const storeCount = useMemo(() => groupDiscountsByStore(data).length, [data]);

  const handleDiscountPress = useCallback((_id: string) => {
    // Detay ekranı sonraki adımda eklenecek
  }, []);

  const navigateCompare = useCallback(() => {
    router.push('/discounts/compare');
  }, [router]);

  const navigateAlerts = useCallback(() => {
    router.push('/discounts/alerts');
  }, [router]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.headerBlock}>
          <ScreenHeader
            title="İndirimler"
            subtitle="Market fırsatlarını takip edin, en uygun fiyatı bulun."
          />
        </View>

        <View style={styles.quickActions}>
          <FeatureCard
            title="Market Karşılaştırması"
            description="BİM, ŞOK, A101 ve Migros fiyatlarını yan yana görün."
            icon="stats-chart"
            iconColor={colors.primary}
            onPress={navigateCompare}
          />
          <FeatureCard
            title="Fiyat Alarmı & Ürün Takibi"
            description="Sık aldığınız ürünleri takip edin, fiyat düşünce bildirim alın."
            icon="notifications"
            iconColor={colors.accent}
            onPress={navigateAlerts}
          />
        </View>

        <View style={styles.dealsPanel}>
          <View style={styles.dealsPanelHeader}>
            <View>
              <Text style={styles.dealsTitle}>Güncel Fırsatlar</Text>
              <Text style={styles.dealsSubtitle}>
                İndirimler marketlere göre gruplandı — kaydırarak keşfedin.
              </Text>
            </View>
            {!isLoading && totalDeals > 0 ? (
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>{totalDeals}</Text>
                <Text style={styles.summaryBadgeLabel}>fırsat</Text>
              </View>
            ) : null}
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {!isLoading && !error && storeCount > 0 ? (
            <Text style={styles.storeSummary}>{storeCount} markette aktif indirim var</Text>
          ) : null}

          {!isLoading ? (
            <DiscountDealsByStore discounts={data} onPress={handleDiscountPress} />
          ) : null}
        </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  dealsPanel: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dealsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  dealsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dealsSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    maxWidth: 260,
  },
  summaryBadge: {
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 64,
  },
  summaryBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
    lineHeight: 26,
  },
  summaryBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  storeSummary: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  error: {
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
});
