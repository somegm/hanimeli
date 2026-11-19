import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import type { AIGeneratedRecipe } from '@/types/pantry';

interface AISuggestionCardProps {
  recipe: AIGeneratedRecipe;
}

function AISuggestionCardComponent({ recipe }: AISuggestionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>
      <Text style={styles.meta}>{recipe.prepTimeMinutes} dk · {recipe.ingredients.length} malzeme</Text>

      <Text style={styles.sectionTitle}>Malzemeler</Text>
      {recipe.ingredients.map((item) => (
        <Text key={item} style={styles.listItem}>• {item}</Text>
      ))}

      <Text style={styles.sectionTitle}>Adımlar</Text>
      {recipe.steps.map((step, index) => (
        <Text key={step} style={styles.listItem}>{index + 1}. {step}</Text>
      ))}
    </View>
  );
}

export const AISuggestionCard = memo(AISuggestionCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  listItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});
