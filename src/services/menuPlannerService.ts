import { generateWeeklyMenu } from '@/services/api/contentApi';
import { fetchCurrentWeeklyMenu } from '@/services/api/contentApi';
import type { WeekDay } from '@/types/menu';

export async function getWeeklyMenu() {
  const data = await fetchCurrentWeeklyMenu();
  return data.menu;
}

export async function generatePersonalizedMenu() {
  return generateWeeklyMenu();
}

export async function generateShoppingListFromMenu() {
  const data = await fetchCurrentWeeklyMenu();
  return data.shoppingIngredients;
}

export function getDayLabel(day: WeekDay): string {
  const labels: Record<WeekDay, string> = {
    pazartesi: 'Pazartesi',
    sali: 'Salı',
    carsamba: 'Çarşamba',
    persembe: 'Perşembe',
    cuma: 'Cuma',
    cumartesi: 'Cumartesi',
    pazar: 'Pazar',
  };
  return labels[day];
}
