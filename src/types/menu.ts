export type WeekDay =
  | 'pazartesi'
  | 'sali'
  | 'carsamba'
  | 'persembe'
  | 'cuma'
  | 'cumartesi'
  | 'pazar';

export interface DayMenu {
  day: WeekDay;
  dayLabel: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface WeeklyMenu {
  id: string;
  weekLabel: string;
  days: DayMenu[];
}

export interface ShoppingListIngredient {
  name: string;
  quantity: string;
  category: string;
}
