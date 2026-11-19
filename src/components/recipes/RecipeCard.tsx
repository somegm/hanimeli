import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, radius, shadows, spacing } from '@/theme';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (id: string) => void;
}

const DIFFICULTY_LABELS: Record<Recipe['difficulty'], string> = {
  kolay: 'Kolay',
  orta: 'Orta',
  zor: 'Zor',
};

function RecipeCardComponent({ recipe, onPress }: RecipeCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const metaText = useMemo(
    () =>
      `${recipe.prepTimeMinutes} dk · ${recipe.servings} kişilik · ${DIFFICULTY_LABELS[recipe.difficulty]}`,
    [recipe.difficulty, recipe.prepTimeMinutes, recipe.servings],
  );

  const handlePress = () => {
    onPress(recipe.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title} tarifi`}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(26, 29, 36, 0.85)']}
            style={styles.imageOverlay}
          />
          {recipe.isDailyPick ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Günün Tarifi</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
          <Text style={styles.meta}>{metaText}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export const RecipeCard = memo(RecipeCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.md,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 170,
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  content: {
    padding: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});
