export type TipCategory = 'artik-yemek' | 'hamur' | 'saklama' | 'puf-nokta';

export interface CookingTip {
  id: string;
  title: string;
  content: string;
  category: TipCategory;
  categoryLabel: string;
}
