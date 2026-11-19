import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function ShoppingLayout() {
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
      <Stack.Screen name="[listId]" options={{ title: 'Alışveriş Listesi' }} />
      <Stack.Screen name="route" options={{ title: 'Market Rotası' }} />
    </Stack>
  );
}
