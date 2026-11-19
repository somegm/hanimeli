import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuDayCard } from '@/components/recipes/MenuDayCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useApp } from '@/context/AppContext';
import {
  generatePersonalizedMenu,
  generateShoppingListFromMenu,
  getWeeklyMenu,
} from '@/services/menuPlannerService';
import { colors, spacing } from '@/theme';
import type { WeeklyMenu } from '@/types/menu';

export default function WeeklyMenuScreen() {
  const router = useRouter();
  const { shoppingLists, importMenuToList } = useApp();
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu | null>(null);
  const [costSummary, setCostSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      const menu = await getWeeklyMenu();
      setWeeklyMenu(menu);
      setError(null);
    } catch {
      setError('Haftalık menü yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const handleGenerateMenu = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await generatePersonalizedMenu();
      setWeeklyMenu(result.menu);
      const bestStore = result.costEstimate.storeTotals[0];
      if (bestStore) {
        setCostSummary(
          `Bu hafta malzemeler ${bestStore.store} marketinde yaklaşık ${bestStore.total.toFixed(2)} ₺`,
        );
      }
      setError(null);
    } catch {
      Alert.alert('Hata', 'Kişiselleştirilmiş menü oluşturulamadı.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleCreateShoppingList = useCallback(async () => {
    const ingredients = await generateShoppingListFromMenu();
    const targetList = shoppingLists[0];

    if (!targetList) {
      Alert.alert('Liste bulunamadı', 'Önce bir alışveriş listesi oluşturun.');
      return;
    }

    await importMenuToList(targetList.id, ingredients);
    Alert.alert(
      'Alışveriş listesi hazır!',
      `${ingredients.length} ürün "${targetList.title}" listesine eklendi.`,
      [
        { text: 'Tamam' },
        {
          text: 'Listeye git',
          onPress: () => router.push(`/shopping/${targetList.id}` as Href),
        },
      ],
    );
  }, [shoppingLists, importMenuToList, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ActivityIndicator color={colors.primary} style={styles.loader} size="large" />
      </SafeAreaView>
    );
  }

  if (!weeklyMenu) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.error}>{error ?? 'Menü bulunamadı.'}</Text>
        <View style={styles.buttonWrap}>
          <PrimaryButton
            label="Kişisel Menü Oluştur"
            onPress={handleGenerateMenu}
            disabled={isGenerating}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.weekLabel}>{weeklyMenu.weekLabel}</Text>
        <Text style={styles.hint}>
          Profildeki diyet, hane ve dolap bilgilerinize göre menü oluşturabilirsiniz.
        </Text>

        {costSummary ? <Text style={styles.costSummary}>{costSummary}</Text> : null}

        <View style={styles.buttonWrap}>
          <PrimaryButton
            label="Kişisel Menü Oluştur"
            onPress={handleGenerateMenu}
            disabled={isGenerating}
            variant="outline"
          />
        </View>

        {weeklyMenu.days.map((dayMenu) => (
          <MenuDayCard key={dayMenu.day} dayMenu={dayMenu} />
        ))}

        <View style={styles.buttonWrap}>
          <PrimaryButton label="Alışveriş Listesi Oluştur" onPress={handleCreateShoppingList} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  weekLabel: { fontSize: 18, fontWeight: '700', color: colors.primaryDark, marginBottom: spacing.xs },
  hint: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  costSummary: { fontSize: 14, fontWeight: '600', color: colors.success, marginBottom: spacing.md },
  buttonWrap: { marginBottom: spacing.md },
  loader: { marginTop: spacing.xl },
  error: { padding: spacing.lg, fontSize: 14, color: colors.accent, textAlign: 'center' },
});
