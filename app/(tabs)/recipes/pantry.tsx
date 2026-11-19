import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AISuggestionCard } from '@/components/recipes/AISuggestionCard';
import { IngredientChip } from '@/components/recipes/IngredientChip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useApiData } from '@/hooks/useApiData';
import { fetchPantryIngredients } from '@/services/api/contentApi';
import { ApiError } from '@/services/api/client';
import { generateRecipesFromPantry } from '@/services/aiRecipeService';
import { colors, spacing } from '@/theme';
import type { PantryIngredient, AIGeneratedRecipe } from '@/types/pantry';

export default function PantryScreen() {
  const { data: ingredients, isLoading, error } = useApiData<PantryIngredient[]>([], fetchPantryIngredients);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<AIGeneratedRecipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selectedIds.length < 2) {
      return;
    }

    setIsGenerating(true);
    setHasSearched(true);
    setGenerateError(null);

    try {
      const results = await generateRecipesFromPantry(selectedIds);
      setSuggestions(results);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Tarif önerileri oluşturulamadı. Lütfen tekrar deneyin.';
      setGenerateError(message);
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedIds]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>
          Evdeki malzemeleri seçin (en az 2). Yapay zeka size uygun tarifler önerecek.
        </Text>

        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.chipGrid}>
          {ingredients.map((ingredient) => (
            <IngredientChip
              key={ingredient.id}
              id={ingredient.id}
              name={ingredient.name}
              emoji={ingredient.emoji}
              isSelected={selectedIds.includes(ingredient.id)}
              onToggle={handleToggle}
            />
          ))}
        </View>

        <PrimaryButton
          label={isGenerating ? 'Tarifler hazırlanıyor...' : 'Tarif Öner'}
          onPress={handleGenerate}
          disabled={selectedIds.length < 2 || isGenerating}
        />

        {isGenerating ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
        ) : null}

        {generateError ? <Text style={styles.error}>{generateError}</Text> : null}

        {hasSearched && !isGenerating && suggestions.length === 0 && !generateError ? (
          <Text style={styles.empty}>
            Seçilen malzemelerle eşleşen tarif bulunamadı. Farklı kombinasyonlar deneyin.
          </Text>
        ) : null}

        {suggestions.map((recipe) => (
          <AISuggestionCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.lg,
  },
  error: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
  },
  empty: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
