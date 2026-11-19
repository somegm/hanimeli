import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function DiscountsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="compare" options={{ title: 'Market Karşılaştırması' }} />
      <Stack.Screen name="alerts" options={{ title: 'Fiyat Alarmları' }} />
      <Stack.Screen name="product/[productId]" options={{ title: 'Ürün Detayı' }} />
      <Stack.Screen name="discount/[discountId]" options={{ title: 'İndirim Detayı' }} />
    </Stack>
  );
}
