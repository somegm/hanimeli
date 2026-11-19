import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AISuggestionCard } from '@/components/recipes/AISuggestionCard';
import { IngredientChip } from '@/components/recipes/IngredientChip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useProfile } from '@/context/ProfileContext';
import { useApiData } from '@/hooks/useApiData';
import { fetchPantryIngredients } from '@/services/api/contentApi';
import { fetchExpiringRecipes } from '@/services/api/profileApi';
import { colors, spacing } from '@/theme';
import type { PantryIngredient } from '@/types/pantry';
import type { PantryItem } from '@/types/profile';
import type { AIGeneratedRecipe } from '@/types/pantry';

export default function MyPantryScreen() {
  const { profile, updatePantry } = useProfile();
  const { data: catalogIngredients, isLoading } = useApiData<PantryIngredient[]>(
    [],
    fetchPantryIngredients,
  );
  const [items, setItems] = useState<PantryItem[]>([]);
  const [expiryInput, setExpiryInput] = useState('');
  const [wasteRecipes, setWasteRecipes] = useState<AIGeneratedRecipe[]>([]);

  useEffect(() => {
    if (profile?.pantryItems) {
      setItems(profile.pantryItems);
    }
  }, [profile?.pantryItems]);

  const handleToggle = useCallback(
    (id: string) => {
      const ingredient = catalogIngredients.find((item) => item.id === id);
      if (!ingredient) {
        return;
      }
      setItems((prev) => {
        const exists = prev.find((item) => item.ingredientId === id);
        if (exists) {
          return prev.filter((item) => item.ingredientId !== id);
        }
        return [
          ...prev,
          {
            ingredientId: ingredient.id,
            name: ingredient.name,
            quantity: '1',
            expiresAt: expiryInput || null,
          },
        ];
      });
    },
    [catalogIngredients, expiryInput],
  );

  const handleSave = useCallback(async () => {
    await updatePantry(items);
    Alert.alert('Kaydedildi', 'Dolap envanteriniz güncellendi.');
  }, [items, updatePantry]);

  const handleWasteSuggestions = useCallback(async () => {
    const result = await fetchExpiringRecipes();
    setWasteRecipes(result.recipes);
    if (result.recipes.length === 0) {
      Alert.alert('Öneri yok', result.message ?? 'Yaklaşan SKT ürünleri için tarif bulunamadı.');
    }
  }, []);

  const selectedIds = new Set(items.map((item) => item.ingredientId));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Evdeki malzemelerinizi kaydedin. Son kullanma tarihi yaklaşan ürünler için bildirim
          alırsınız.
        </Text>

        <Text style={styles.label}>Son kullanma (YYYY-MM-DD, opsiyonel)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-06-20"
          placeholderTextColor={colors.textSecondary}
          value={expiryInput}
          onChangeText={setExpiryInput}
        />

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

        <View style={styles.chips}>
          {catalogIngredients.map((ingredient) => (
            <IngredientChip
              key={ingredient.id}
              id={ingredient.id}
              name={ingredient.name}
              emoji={ingredient.emoji}
              isSelected={selectedIds.has(ingredient.id)}
              onToggle={handleToggle}
            />
          ))}
        </View>

        {items.length > 0 ? (
          <View style={styles.savedBox}>
            <Text style={styles.savedTitle}>Dolabınızda ({items.length})</Text>
            {items.map((item) => (
              <Text key={item.ingredientId} style={styles.savedItem}>
                {item.name}
                {item.expiresAt ? ` · SKT: ${item.expiresAt}` : ''}
              </Text>
            ))}
          </View>
        ) : null}

        <PrimaryButton label="Dolabı Kaydet" onPress={handleSave} />
        <PrimaryButton
          label="SKT Yaklaşan Ürünlerle Tarif Öner"
          onPress={handleWasteSuggestions}
          variant="outline"
        />

        {wasteRecipes.map((recipe) => (
          <AISuggestionCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  hint: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  savedBox: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  savedTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  savedItem: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
