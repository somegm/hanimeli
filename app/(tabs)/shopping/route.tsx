import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useApp } from '@/context/AppContext';
import { suggestMarketRoute } from '@/services/api/profileApi';
import { colors, spacing } from '@/theme';
import type { RouteStop } from '@/types/product';

export default function MarketRouteScreen() {
  const { shoppingLists } = useApp();
  const router = useRouter();
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoute = useCallback(async () => {
    const items = shoppingLists.flatMap((list) =>
      list.items.filter((item) => !item.isChecked).map((item) => item.name),
    );

    if (items.length === 0) {
      setStops([]);
      setIsLoading(false);
      return;
    }

    try {
      const result = await suggestMarketRoute(items);
      setStops(result.stops);
    } catch {
      Alert.alert('Hata', 'Rota oluşturulamadı. Konum ayarlarınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  }, [shoppingLists]);

  useEffect(() => {
    void loadRoute();
  }, [loadRoute]);

  const handleOpenMaps = useCallback((url: string) => {
    void Linking.openURL(url);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Alışveriş listenize ve indirimlere göre önerilen market rotası. Profilde konum
          ayarladığınızdan emin olun.
        </Text>

        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}

        {!isLoading && stops.length === 0 ? (
          <Text style={styles.empty}>Rota için işaretlenmemiş liste ürünü gerekli.</Text>
        ) : null}

        {stops.map((stop, index) => (
          <View key={stop.storeName} style={styles.stopCard}>
            <Text style={styles.stopIndex}>{index + 1}. Durak</Text>
            <Text style={styles.storeName}>{stop.storeName}</Text>
            <Text style={styles.reason}>{stop.reason}</Text>
            <PrimaryButton
              label="Google Maps'te Aç"
              onPress={() => handleOpenMaps(stop.mapsUrl)}
              variant="outline"
            />
          </View>
        ))}

        <Pressable onPress={() => router.push('/profile' as Href)}>
          <Text style={styles.link}>Konum ayarlarını düzenle →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  hint: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  empty: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
  stopCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  stopIndex: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  storeName: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  reason: { fontSize: 14, color: colors.textSecondary, marginVertical: spacing.sm },
  link: { textAlign: 'center', color: colors.primary, fontWeight: '600', marginTop: spacing.md },
});
