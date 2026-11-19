import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function RecipesLayout() {
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
      <Stack.Screen name="pantry" options={{ title: 'Dolabımda Ne Var?' }} />
      <Stack.Screen name="weekly-menu" options={{ title: 'Haftalık Menü' }} />
      <Stack.Screen name="[recipeId]" options={{ title: 'Tarif Detayı' }} />
      <Stack.Screen name="my-pantry" options={{ title: 'Dolabım Envanteri' }} />
      <Stack.Screen name="tips" options={{ title: 'Püf Noktaları' }} />
    </Stack>
  );
}
