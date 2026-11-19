import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CITY_LOCATIONS } from '@/constants/cityLocations';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { registerPushToken, syncMarketForMyLocation } from '@/services/api/profileApi';
import { getExpoPushToken, requestNotificationPermission } from '@/services/notificationService';
import { colors, radius, spacing } from '@/theme';

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isGuest, logout } = useAuth();
  const { profile, setLocation, setDietProfile, setHousehold } = useProfile();

  useEffect(() => {
    void requestNotificationPermission().then(async (granted) => {
      if (!granted) {
        return;
      }
      const token = await getExpoPushToken();
      if (token) {
        await registerPushToken(token);
      }
    });
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => {
          void logout().then(() => {
            router.replace('/login' as Href);
          });
        },
      },
    ]);
  }, [logout, router]);

  const handleGoToLogin = useCallback(() => {
    void logout().then(() => {
      router.replace('/login' as Href);
    });
  }, [logout, router]);

  const handleSelectCity = useCallback(
    async (city: (typeof CITY_LOCATIONS)[number]) => {
      await setLocation({
        city: city.city,
        latitude: city.latitude,
        longitude: city.longitude,
        label: city.label,
      });
      try {
        await syncMarketForMyLocation();
        Alert.alert('Konum güncellendi', `${city.label} için market fiyatları yenilendi.`);
      } catch {
        Alert.alert('Konum kaydedildi', 'Market fiyatları bir sonraki senkronda güncellenecek.');
      }
    },
    [setLocation],
  );

  const handleDietToggle = useCallback(
    async (key: 'vegetarian' | 'vegan' | 'glutenFree' | 'lactoseFree', value: boolean) => {
      if (!profile) {
        return;
      }
      await setDietProfile({ ...profile.dietProfile, [key]: value });
    },
    [profile, setDietProfile],
  );

  const handleHouseholdChange = useCallback(
    async (field: 'adultCount' | 'dailyCalorieTarget', value: string) => {
      if (!profile) {
        return;
      }
      const num = Number(value);
      if (!Number.isFinite(num)) {
        return;
      }
      await setHousehold({ ...profile.household, [field]: num });
    },
    [profile, setHousehold],
  );

  if (!user || !profile) {
    return null;
  }

  const initials = getInitials(user.displayName);
  const diet = profile.dietProfile;
  const household = profile.household;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profil" subtitle="Hesap, konum ve tercihlerinizi yönetin." />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {isGuest ? (
              <Ionicons name="person-outline" size={40} color={colors.primary} />
            ) : (
              <Text style={styles.initials}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>{user.displayName}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isGuest ? 'Misafir Hesap' : 'Kayıtlı Hesap'}</Text>
          </View>
          {user.email ? <Text style={styles.infoText}>{user.email}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Konum</Text>
        <Text style={styles.sectionHint}>
          Seçili: {profile.location?.label ?? 'Ayarlanmadı (Ankara varsayılan)'}
        </Text>
        <View style={styles.cityRow}>
          {CITY_LOCATIONS.map((city) => (
            <Pressable
              key={city.city}
              style={[
                styles.cityChip,
                profile.location?.city === city.city && styles.cityChipActive,
              ]}
              onPress={() => void handleSelectCity(city)}
            >
              <Text
                style={[
                  styles.cityChipText,
                  profile.location?.city === city.city && styles.cityChipTextActive,
                ]}
              >
                {city.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Diyet & Alerji</Text>
        {(
          [
            ['vegetarian', 'Vejetaryen'],
            ['vegan', 'Vegan'],
            ['glutenFree', 'Glutensiz'],
            ['lactoseFree', 'Laktozsuz'],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{label}</Text>
            <Switch
              value={diet[key]}
              onValueChange={(value) => void handleDietToggle(key, value)}
              trackColor={{ true: colors.primary }}
            />
          </View>
        ))}

        <Text style={styles.sectionTitle}>Hane Profili</Text>
        <Text style={styles.fieldLabel}>Yetişkin sayısı</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          defaultValue={String(household.adultCount)}
          onEndEditing={(e) => void handleHouseholdChange('adultCount', e.nativeEvent.text)}
        />
        <Text style={styles.fieldLabel}>Günlük kalori hedefi</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          defaultValue={String(household.dailyCalorieTarget)}
          onEndEditing={(e) => void handleHouseholdChange('dailyCalorieTarget', e.nativeEvent.text)}
        />

        <Text style={styles.sectionTitle}>İstatistikler</Text>
        <Text style={styles.statText}>Favori tarif: {profile.favoriteRecipeIds.length}</Text>
        <Text style={styles.statText}>Yapılan tarif: {profile.cookedRecipeIds.length}</Text>
        <Text style={styles.statText}>Dolap ürünü: {profile.pantryItems.length}</Text>

        {isGuest ? (
          <PrimaryButton label="Giriş Yap / Kayıt Ol" onPress={handleGoToLogin} />
        ) : null}
        <PrimaryButton
          label="Çıkış Yap"
          onPress={handleLogout}
          variant={isGuest ? 'outline' : 'secondary'}
        />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  profileCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryMuted,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  initials: { fontSize: 28, fontWeight: '700', color: colors.primary },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  badge: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  infoText: { fontSize: 15, color: colors.textSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  sectionHint: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
  cityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  cityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityChipText: { fontSize: 14, color: colors.text },
  cityChipTextActive: { color: colors.onPrimary, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  switchLabel: { fontSize: 15, color: colors.text },
  fieldLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
  },
  statText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
