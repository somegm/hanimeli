import type { StoreName, TrackedSearch } from './types';

export const MARKET_FIYATI_BASE_URL = 'https://api.marketfiyati.org.tr/api/v2';

export const TARGET_MARKETS: StoreName[] = ['BIM', 'Şok', 'A101', 'Migros'];

export const MARKET_NAME_MAP: Record<string, StoreName> = {
  bim: 'BIM',
  sok: 'Şok',
  a101: 'A101',
  migros: 'Migros',
};

export const TRACKED_SEARCHES: TrackedSearch[] = [
  { keyword: 'süt 1 litre', productKey: 'sut-1l', category: 'Süt Ürünleri' },
  { keyword: 'zeytinyağı 1 litre', productKey: 'zeytinyagi-1l', category: 'Temel Gıda' },
  { keyword: 'bebek bezi', productKey: 'bebek-bezi', category: 'Bebek' },
  { keyword: 'bulaşık deterjanı', productKey: 'deterjan', category: 'Temizlik' },
  { keyword: 'tavuk göğsü', productKey: 'tavuk-gogsu', category: 'Et & Tavuk' },
  { keyword: 'domates 1 kg', productKey: 'domates-1kg', category: 'Sebze & Meyve' },
  { keyword: 'yumurta 15li', productKey: 'yumurta', category: 'Süt Ürünleri' },
  { keyword: 'peynir 1 kg', productKey: 'peynir', category: 'Süt Ürünleri' },
  { keyword: 'pirinç 1 kg', productKey: 'pirinc-1kg', category: 'Temel Gıda' },
  { keyword: 'mercimek 1 kg', productKey: 'mercimek', category: 'Bakliyat' },
];

/** İndirim taraması — temel gıda, bakım, temizlik, teknoloji vb. geniş kategori listesi */
export const DISCOUNT_SEARCH_KEYWORDS = [
  // Temel gıda
  'süt',
  'ekmek',
  'un',
  'pirinç',
  'makarna',
  'bulgur',
  'zeytinyağı',
  'ayçiçek yağı',
  'peynir',
  'yumurta',
  'tereyağı',
  'şeker',
  'tuz',
  'salça',
  'konserve',
  // Et & protein
  'tavuk',
  'kıyma',
  'sucuk',
  'salam',
  'sosis',
  'balık',
  // Sebze & meyve
  'domates',
  'patates',
  'soğan',
  'biber',
  'elma',
  'muz',
  'portakal',
  'limon',
  'salatalık',
  // Bakliyat
  'mercimek',
  'fasulye',
  'nohut',
  'barbunya',
  // Temizlik
  'deterjan',
  'çamaşır suyu',
  'yüzey temizleyici',
  'bulaşık süngeri',
  'çöp torbası',
  // Kişisel bakım
  'şampuan',
  'saç kremi',
  'diş macunu',
  'diş fırçası',
  'sabun',
  'duş jeli',
  'deodorant',
  'tıraş',
  'kağıt havlu',
  'tuvalet kağıdı',
  'ıslak mendil',
  'peçete',
  // Bebek
  'bebek bezi',
  'bebek maması',
  'bebek şampuan',
  // İçecek & atıştırmalık
  'su',
  'kola',
  'meyve suyu',
  'çay',
  'kahve',
  'çikolata',
  'bisküvi',
  'cips',
  'kraker',
  // Ev & mutfak
  'tencere',
  'tava',
  'saklama kabı',
  'fırın poşeti',
  'streç film',
  // Teknoloji & aksesuar
  'kulaklık',
  'powerbank',
  'usb kablo',
  'şarj aleti',
  'pil',
  'telefon kılıfı',
  'mouse',
  'klavye',
  'flash bellek',
  'adaptör',
];

export const DEFAULT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
