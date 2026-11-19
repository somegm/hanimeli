import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useApp } from '@/context/AppContext';
import { useProfile } from '@/context/ProfileContext';
import {
  fetchRecipeDetail,
  markRecipeCooked,
  rateRecipe,
  toggleRecipeFavorite,
} from '@/services/api/catalogApi';
import { colors, spacing } from '@/theme';
import type { RecipeDetail } from '@/types/recipe';

export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const { shoppingLists, addListItem } = useApp();
  const { isFavoriteRecipe, refreshProfile } = useProfile();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      return;
    }

    void fetchRecipeDetail(recipeId)
      .then((data) => {
        setRecipe(data);
        setIsFavorite(isFavoriteRecipe(recipeId));
        setError(null);
      })
      .catch(() => setError('Tarif yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [recipeId, isFavoriteRecipe]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipeId) {
      return;
    }
    const result = await toggleRecipeFavorite(recipeId);
    setIsFavorite(result.isFavorite);
    await refreshProfile();
  }, [recipeId, refreshProfile]);

  const handleMarkCooked = useCallback(async () => {
    if (!recipeId || !recipe) {
      return;
    }
    const result = await markRecipeCooked(recipeId);
    setRecipe({ ...recipe, cookCount: result.cookCount });
    await refreshProfile();
    Alert.alert('Afiyet olsun!', 'Tarif geçmişinize eklendi.');
  }, [recipeId, recipe, refreshProfile]);

  const handleRate = useCallback(
    async (rating: number) => {
      if (!recipeId || !recipe) {
        return;
      }
      const result = await rateRecipe(recipeId, rating);
      setRecipe({
        ...recipe,
        averageRating: result.averageRating,
        ratingCount: result.ratingCount,
      });
    },
    [recipeId, recipe],
  );

  const handleAddToShoppingList = useCallback(async () => {
    if (!recipe) {
      return;
    }
    const targetList = shoppingLists[0];
    if (!targetList) {
      Alert.alert('Liste yok', 'Önce bir alışveriş listesi oluşturun.');
      return;
    }

    for (const ingredient of recipe.ingredients) {
      await addListItem(targetList.id, ingredient, '1');
    }

    Alert.alert('Eklendi', `${recipe.ingredients.length} malzeme listeye eklendi.`, [
      { text: 'Tamam' },
      { text: 'Listeye git', onPress: () => router.push(`/shopping/${targetList.id}`) },
    ]);
  }, [recipe, shoppingLists, addListItem, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Tarif bulunamadı'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Pressable onPress={handleToggleFavorite} accessibilityLabel="Favorilere ekle">
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? colors.accent : colors.textSecondary}
            />
          </Pressable>
        </View>
        <Text style={styles.description}>{recipe.description}</Text>
        <Text style={styles.meta}>
          {recipe.prepTimeMinutes} dk · {recipe.servings} kişilik · {recipe.category}
        </Text>

        {recipe.nutrition ? (
          <View style={styles.nutritionBox}>
            <Text style={styles.sectionTitle}>Beslenme (porsiyon)</Text>
            <Text style={styles.nutritionText}>
              {recipe.nutrition.calories} kcal · P {recipe.nutrition.protein}g · K{' '}
              {recipe.nutrition.carbs}g · Y {recipe.nutrition.fat}g
            </Text>
          </View>
        ) : null}

        {(recipe.averageRating ?? 0) > 0 ? (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ★ {recipe.averageRating?.toFixed(1)} ({recipe.ratingCount} oy) · {recipe.cookCount}{' '}
              kez yapıldı
            </Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => void handleRate(star)}>
                  <Ionicons name="star" size={22} color={colors.accent} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Malzemeler</Text>
        {recipe.ingredients.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Yapılışı</Text>
        {recipe.steps.map((step, index) => (
          <Text key={step} style={styles.step}>
            {index + 1}. {step}
          </Text>
        ))}

        <PrimaryButton label="Alışveriş Listesine Ekle" onPress={handleAddToShoppingList} />
        <PrimaryButton label="Yaptım!" onPress={handleMarkCooked} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  image: { width: '100%', height: 220, borderRadius: 16, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, fontSize: 24, fontWeight: '700', color: colors.text },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginTop: spacing.sm },
  meta: { fontSize: 14, color: colors.primaryDark, fontWeight: '600', marginTop: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  listItem: { fontSize: 15, color: colors.text, lineHeight: 24 },
  step: { fontSize: 15, color: colors.text, lineHeight: 24, marginBottom: spacing.sm },
  nutritionBox: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  nutritionText: { fontSize: 14, color: colors.textSecondary },
  ratingRow: { marginTop: spacing.md },
  ratingText: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  stars: { flexDirection: 'row', gap: spacing.xs },
  error: { color: colors.accent, fontSize: 15 },
});
