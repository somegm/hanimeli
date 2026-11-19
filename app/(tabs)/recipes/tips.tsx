import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TipCard } from '@/components/recipes/TipCard';
import { useApiData } from '@/hooks/useApiData';
import { fetchCookingTips } from '@/services/api/contentApi';
import { colors, spacing } from '@/theme';
import type { CookingTip } from '@/types/tip';
import type { TipCategory } from '@/types/tip';

const CATEGORIES: { key: TipCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'artik-yemek', label: 'Artık Yemek' },
  { key: 'hamur', label: 'Hamur' },
  { key: 'saklama', label: 'Saklama' },
  { key: 'puf-nokta', label: 'Püf Nokta' },
];

export default function TipsScreen() {
  const [activeCategory, setActiveCategory] = useState<TipCategory | 'all'>('all');
  const loader = useCallback(
    () => fetchCookingTips(activeCategory),
    [activeCategory],
  );
  const { data, isLoading, error } = useApiData<CookingTip[]>([], loader);

  const filteredTips = useMemo(() => data, [data]);

  const handleCategoryPress = useCallback((key: TipCategory | 'all') => {
    setActiveCategory(key);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CookingTip }) => <TipCard tip={item} />,
    [],
  );

  const keyExtractor = useCallback((item: CookingTip) => item.id, []);

  const listHeader = useCallback(
    () => (
      <View style={styles.filters}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.key}
            style={[
              styles.filterChip,
              activeCategory === category.key && styles.filterChipActive,
            ]}
            onPress={() => handleCategoryPress(category.key)}
          >
            <Text
              style={[
                styles.filterLabel,
                activeCategory === category.key && styles.filterLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    ),
    [activeCategory, handleCategoryPress, isLoading, error],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlashList
        data={filteredTips}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterLabelActive: {
    color: colors.surface,
  },
  loader: {
    width: '100%',
    marginTop: spacing.sm,
  },
  error: {
    width: '100%',
    color: colors.accent,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
});
