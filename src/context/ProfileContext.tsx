import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchExpiringPantry,
  fetchUserPantry,
  fetchUserProfile,
  saveUserPantry,
  updateDietProfile,
  updateHouseholdProfile,
  updateUserLocation,
} from '@/services/api/profileApi';
import type { DietProfile, HouseholdProfile, PantryItem, UserLocation, UserProfile } from '@/types/profile';

interface ProfileContextValue {
  profile: UserProfile | null;
  expiringPantry: PantryItem[];
  refreshProfile: () => Promise<void>;
  setLocation: (location: UserLocation) => Promise<void>;
  setDietProfile: (diet: DietProfile) => Promise<void>;
  setHousehold: (household: HouseholdProfile) => Promise<void>;
  updatePantry: (items: PantryItem[]) => Promise<void>;
  isFavoriteRecipe: (recipeId: string) => boolean;
  isHydrated: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [expiringPantry, setExpiringPantry] = useState<PantryItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const [userProfile, expiring] = await Promise.all([
        fetchUserProfile(),
        fetchExpiringPantry(),
      ]);
      setProfile(userProfile);
      setExpiringPantry(expiring.items);
    } catch {
      setProfile(null);
      setExpiringPantry([]);
    }
  }, []);

  useEffect(() => {
    void refreshProfile().finally(() => setIsHydrated(true));
  }, [refreshProfile]);

  const setLocation = useCallback(async (location: UserLocation) => {
    await updateUserLocation(location);
    await refreshProfile();
  }, [refreshProfile]);

  const setDietProfile = useCallback(async (diet: DietProfile) => {
    await updateDietProfile(diet);
    await refreshProfile();
  }, [refreshProfile]);

  const setHousehold = useCallback(async (household: HouseholdProfile) => {
    await updateHouseholdProfile(household);
    await refreshProfile();
  }, [refreshProfile]);

  const updatePantry = useCallback(async (items: PantryItem[]) => {
    await saveUserPantry(items);
    await refreshProfile();
  }, [refreshProfile]);

  const isFavoriteRecipe = useCallback(
    (recipeId: string) => profile?.favoriteRecipeIds.includes(recipeId) ?? false,
    [profile],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      expiringPantry,
      refreshProfile,
      setLocation,
      setDietProfile,
      setHousehold,
      updatePantry,
      isFavoriteRecipe,
      isHydrated,
    }),
    [
      profile,
      expiringPantry,
      refreshProfile,
      setLocation,
      setDietProfile,
      setHousehold,
      updatePantry,
      isFavoriteRecipe,
      isHydrated,
    ],
  );

  if (!isHydrated) {
    return null;
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
