import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '@/components/recipes/RecipeCard';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApiData } from '@/hooks/useApiData';
import { fetchRecipes } from '@/services/api/catalogApi';
import { colors, spacing } from '@/theme';
import type { Recipe } from '@/types/recipe';

export default function RecipesScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useApiData<Recipe[]>([], fetchRecipes);

  const handleRecipePress = useCallback(
    (id: string) => {
      router.push(`/recipes/${id}` as Href);
    },
    [router],
  );

  const navigateMyPantry = useCallback(() => {
    router.push('/recipes/my-pantry' as Href);
  }, [router]);

  const navigatePantry = useCallback(() => {
    router.push('/recipes/pantry');
  }, [router]);

  const navigateWeeklyMenu = useCallback(() => {
    router.push('/recipes/weekly-menu');
  }, [router]);

  const navigateTips = useCallback(() => {
    router.push('/recipes/tips');
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeCard recipe={item} onPress={handleRecipePress} />
    ),
    [handleRecipePress],
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  const listHeader = useCallback(
    () => (
      <View style={styles.features}>
        <ScreenHeader
          title="Tarifler"
          subtitle="Akıllı mutfak araçlarıyla yemek planlamayı kolaylaştırın."
        />
        <FeatureCard
          title="Dolabım Envanteri"
          description="Evdeki malzemeleri kaydedin, SKT takibi yapın."
          icon="file-tray-full"
          iconColor={colors.success}
          onPress={navigateMyPantry}
        />
        <FeatureCard
          title="Dolabımda Ne Var?"
          description="Malzemelerinizle akıllı tarif önerileri alın."
          icon="sparkles"
          iconColor={colors.primary}
          onPress={navigatePantry}
        />
        <FeatureCard
          title="Haftalık Menü Planlayıcı"
          description="Pazartesiden pazara menü önerisi ve alışveriş listesi oluşturun."
          icon="calendar"
          iconColor={colors.secondary}
          onPress={navigateWeeklyMenu}
        />
        <FeatureCard
          title="Püf Noktaları"
          description="Artık yemek değerlendirme ve mutfak ipuçları."
          icon="bulb"
          iconColor={colors.accent}
          onPress={navigateTips}
        />
        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    ),
    [navigatePantry, navigateMyPantry, navigateWeeklyMenu, navigateTips, isLoading, error],
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  features: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  loader: {
    marginVertical: spacing.md,
  },
  error: {
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
});
