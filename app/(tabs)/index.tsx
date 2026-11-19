import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

import { DiscountCard } from '@/components/discounts/DiscountCard';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { PressableGlassCard } from '@/components/ui/GlassCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatWidget } from '@/components/ui/StatWidget';
import { useApp } from '@/context/AppContext';
import { useProfile } from '@/context/ProfileContext';
import { useApiData } from '@/hooks/useApiData';
import {
  fetchDailyRecipes,
  fetchDiscounts,
  fetchPopularRecipes,
} from '@/services/api/catalogApi';
import { colors, spacing } from '@/theme';
import type { Discount } from '@/types/discount';
import type { Recipe } from '@/types/recipe';

export default function HomeScreen() {
  const router = useRouter();
  const { shoppingLists, trackedProducts } = useApp();
  const { expiringPantry } = useProfile();
  const recipesState = useApiData<Recipe[]>([], fetchDailyRecipes);
  const discountsState = useApiData<Discount[]>([], fetchDiscounts);
  const popularState = useApiData<Recipe[]>([], fetchPopularRecipes);

  const handleRecipePress = useCallback(
    (id: string) => {
      router.push(`/recipes/${id}` as Href);
    },
    [router],
  );

  const handleDiscountPress = useCallback(
    (id: string) => {
      router.push(`/discounts/discount/${id}` as Href);
    },
    [router],
  );

  const navigatePantry = useCallback(() => {
    router.push('/recipes/pantry' as Href);
  }, [router]);

  const navigateCompare = useCallback(() => {
    router.push('/discounts/compare' as Href);
  }, [router]);

  const navigateWeeklyMenu = useCallback(() => {
    router.push('/recipes/weekly-menu' as Href);
  }, [router]);

  const navigateShopping = useCallback(() => {
    router.push('/shopping' as Href);
  }, [router]);

  const navigateAlerts = useCallback(() => {
    router.push('/discounts/alerts' as Href);
  }, [router]);

  const uncheckedItems = shoppingLists.reduce(
    (sum, list) => sum + list.items.filter((item) => !item.isChecked).length,
    0,
  );
  const priceDrops = trackedProducts.filter(
    (p) => p.alertEnabled && p.currentPrice <= p.targetPrice,
  ).length;

  const isLoading = recipesState.isLoading || discountsState.isLoading;
  const error = recipesState.error ?? discountsState.error;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Hanımeli"
          subtitle="Günlük tarifler, akıllı mutfak ve market indirimleri tek uygulamada."
          large
        />

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedFadeIn index={1}>
            <Text style={styles.sectionTitle}>Özet</Text>
          </AnimatedFadeIn>
          <View style={styles.widgetRow}>
            <StatWidget
              title="Günün Tarifi"
              value={recipesState.data[0]?.title ?? '—'}
              icon="restaurant"
              accentColor={colors.primary}
              onPress={navigateWeeklyMenu}
              index={2}
            />
            <StatWidget
              title="Alışveriş"
              value={`${uncheckedItems} ürün bekliyor`}
              icon="cart"
              accentColor={colors.secondary}
              onPress={navigateShopping}
              index={3}
            />
          </View>
          <View style={styles.widgetRow}>
            <StatWidget
              title="Fiyat Alarmı"
              value={`${priceDrops} hedefte`}
              icon="notifications"
              accentColor={colors.accent}
              onPress={navigateAlerts}
              index={4}
            />
            <StatWidget
              title="Dolap"
              value={`${expiringPantry.length} SKT yakın`}
              icon="file-tray-full"
              accentColor={colors.warning}
              onPress={() => router.push('/recipes/my-pantry' as Href)}
              index={5}
            />
          </View>

          {expiringPantry.length > 0 ? (
            <AnimatedFadeIn index={6}>
              <PressableGlassCard
                style={styles.expiryBanner}
                onPress={() => router.push('/recipes/my-pantry' as Href)}
                accessibilityLabel="Dolap uyarısı"
              >
                <View style={styles.expiryInner}>
                  <Text style={styles.expiryTitle}>Dolap uyarısı</Text>
                  <Text style={styles.expiryText}>
                    {expiringPantry.length} ürünün son kullanma tarihi yaklaşıyor
                  </Text>
                </View>
              </PressableGlassCard>
            </AnimatedFadeIn>
          ) : null}

          <AnimatedFadeIn index={7}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          </AnimatedFadeIn>
          <FeatureCard
            title="Dolabımda Ne Var?"
            description="Malzemelerinizle akıllı tarif önerisi alın."
            icon="sparkles"
            iconColor={colors.primary}
            onPress={navigatePantry}
            index={8}
          />
          <FeatureCard
            title="Market Karşılaştırması"
            description="4 marketteki fiyatları yan yana görün."
            icon="stats-chart"
            iconColor={colors.secondary}
            onPress={navigateCompare}
            index={9}
          />
          <FeatureCard
            title="Haftalık Menü"
            description="Kişisel menü planla, alışveriş listesi oluştur."
            icon="calendar"
            iconColor={colors.accent}
            onPress={navigateWeeklyMenu}
            index={10}
          />
          <FeatureCard
            title="Paylaşımlı Alışveriş"
            description="Ailenizle ortak liste yönetin."
            icon="people"
            iconColor={colors.success}
            onPress={navigateShopping}
            index={11}
          />

          <AnimatedFadeIn index={12}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Günün Tarifleri</Text>
              {recipesState.data.slice(0, 2).map((recipe, i) => (
                <Animated.View key={recipe.id} entering={FadeIn.delay(i * 100).duration(400)}>
                  <RecipeCard recipe={recipe} onPress={handleRecipePress} />
                </Animated.View>
              ))}
            </View>
          </AnimatedFadeIn>

          <AnimatedFadeIn index={13}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bu Hafta Popüler</Text>
              {popularState.data.slice(0, 2).map((recipe, i) => (
                <Animated.View key={recipe.id} entering={FadeIn.delay(i * 100).duration(400)}>
                  <RecipeCard recipe={recipe} onPress={handleRecipePress} />
                </Animated.View>
              ))}
            </View>
          </AnimatedFadeIn>

          <AnimatedFadeIn index={14}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Öne Çıkan İndirimler</Text>
              {discountsState.data.slice(0, 2).map((discount, i) => (
                <Animated.View key={discount.id} entering={FadeIn.delay(i * 100).duration(400)}>
                  <DiscountCard discount={discount} onPress={handleDiscountPress} />
                </Animated.View>
              ))}
            </View>
          </AnimatedFadeIn>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  section: { marginTop: spacing.lg },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  widgetRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  expiryBanner: {
    marginBottom: spacing.md,
    backgroundColor: colors.warningMuted,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  expiryInner: {
    padding: spacing.md,
  },
  expiryTitle: { fontSize: 14, fontWeight: '700', color: colors.warning },
  expiryText: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  loader: { marginVertical: spacing.md },
  error: { marginHorizontal: spacing.md, marginBottom: spacing.sm, color: colors.accent, fontSize: 14 },
});
