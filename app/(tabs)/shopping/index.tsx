import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShoppingListCard } from '@/components/shopping/ShoppingListCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';
import type { ShoppingList } from '@/types/shopping';

export default function ShoppingScreen() {
  const router = useRouter();
  const { shoppingLists, createShoppingList, joinShoppingList } = useApp();
  const [shareCode, setShareCode] = useState('');

  const handleListPress = useCallback(
    (id: string) => {
      router.push(`/shopping/${id}` as Href);
    },
    [router],
  );

  const handleCreateList = useCallback(() => {
    void createShoppingList('Yeni Liste').then(() => {
      Alert.alert('Liste oluşturuldu', 'Ailenizle paylaşmak için paylaşım kodunu kullanabilirsiniz.');
    });
  }, [createShoppingList]);

  const handleJoinList = useCallback(async () => {
    const code = shareCode.trim().toUpperCase();
    if (!code) {
      return;
    }

    const joined = await joinShoppingList(code);
    if (!joined) {
      Alert.alert('Hata', 'Paylaşım kodu bulunamadı. Kodu kontrol edip tekrar deneyin.');
      return;
    }

    setShareCode('');
    Alert.alert('Listeye katıldınız!', `"${joined.title}" listesi hesabınıza eklendi.`);
  }, [shareCode, joinShoppingList]);

  const renderItem = useCallback(
    ({ item }: { item: ShoppingList }) => (
      <ShoppingListCard list={item} onPress={handleListPress} />
    ),
    [handleListPress],
  );

  const keyExtractor = useCallback((item: ShoppingList) => item.id, []);

  const listHeader = useCallback(
    () => (
      <View style={styles.header}>
        <ScreenHeader
          title="Alışveriş"
          subtitle="Aile üyelerinizle paylaşımlı listeler oluşturun, anlık senkronize edin."
        />

        <View style={styles.joinBox}>
          <Text style={styles.joinTitle}>Listeye Katıl</Text>
          <Text style={styles.joinHint}>
            Eşiniz veya kız kardeşinizin paylaştığı kodu girerek ortak listeye katılın.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="HAN-4821"
            placeholderTextColor={colors.textSecondary}
            value={shareCode}
            onChangeText={setShareCode}
            autoCapitalize="characters"
          />
          <PrimaryButton
            label="Koda Katıl"
            onPress={handleJoinList}
            disabled={!shareCode.trim()}
            variant="outline"
          />
        </View>

        <PrimaryButton label="Yeni Liste Oluştur" onPress={handleCreateList} />

        <View style={styles.routeBox}>
          <PrimaryButton
            label="Market Rotası Öner"
            onPress={() => router.push('/shopping/route' as Href)}
            variant="outline"
          />
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>Hızlı Ödeme (Yakında)</Text>
          <Text style={styles.paymentText}>
            Masterpass entegrasyonu ile kart saklama ve tek tıkla ödeme desteği planlanıyor.
          </Text>
        </View>
      </View>
    ),
    [shareCode, handleJoinList, handleCreateList, router],
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <FlashList
          data={shoppingLists}
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
  header: {
    marginBottom: spacing.md,
  },
  joinBox: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  joinTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  joinHint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  routeBox: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentInfo: {
    marginTop: spacing.lg,
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  paymentText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
