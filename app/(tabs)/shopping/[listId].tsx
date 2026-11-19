import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListItemRow } from '@/components/shopping/ListItemRow';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';
import type { ShoppingListItem } from '@/types/shopping';

export default function ShoppingListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { shoppingLists, toggleListItem, addListItem } = useApp();
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  const list = useMemo(
    () => shoppingLists.find((item) => item.id === listId),
    [shoppingLists, listId],
  );

  const handleToggle = useCallback(
    (itemId: string) => {
      if (listId) {
        void toggleListItem(listId, itemId);
      }
    },
    [listId, toggleListItem],
  );

  const handleAddItem = useCallback(() => {
    if (listId && newItemName.trim()) {
      void addListItem(listId, newItemName, newItemQty).then(() => {
        setNewItemName('');
        setNewItemQty('');
      });
    }
  }, [listId, newItemName, newItemQty, addListItem]);

  const renderItem = useCallback(
    ({ item }: { item: ShoppingListItem }) => (
      <ListItemRow item={item} onToggle={handleToggle} />
    ),
    [handleToggle],
  );

  const keyExtractor = useCallback((item: ShoppingListItem) => item.id, []);

  const listHeader = useCallback(() => {
    if (!list) {
      return null;
    }

    return (
      <View style={styles.header}>
        <Text style={styles.shareCode}>Paylaşım kodu: {list.shareCode}</Text>
        <Text style={styles.syncNote}>
          Aile üyeleri bu kodu kullanarak listeye katılabilir. Değişiklikler anlık senkronize edilir.
        </Text>

        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Ürün adı"
            placeholderTextColor={colors.textSecondary}
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={styles.inputSmall}
            placeholder="Miktar"
            placeholderTextColor={colors.textSecondary}
            value={newItemQty}
            onChangeText={setNewItemQty}
          />
          <PrimaryButton label="Ekle" onPress={handleAddItem} disabled={!newItemName.trim()} />
        </View>
      </View>
    );
  }, [list, newItemName, newItemQty, handleAddItem]);

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Liste bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlashList
        data={list.items}
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
  header: {
    marginBottom: spacing.md,
  },
  shareCode: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  syncNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  addForm: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  inputSmall: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    width: 120,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  notFound: {
    padding: spacing.lg,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
