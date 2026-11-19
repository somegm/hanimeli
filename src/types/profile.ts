export interface UserLocation {
  city: string;
  district?: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface DietProfile {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  lactoseFree: boolean;
  allergies: string[];
}

export interface HouseholdProfile {
  adultCount: number;
  childAges: number[];
  dailyCalorieTarget: number;
}

export interface PantryItem {
  ingredientId: string;
  name: string;
  quantity: string;
  expiresAt: string | null;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  location?: UserLocation;
  dietProfile: DietProfile;
  household: HouseholdProfile;
  pantryItems: PantryItem[];
  favoriteRecipeIds: string[];
  cookedRecipeIds: string[];
}
