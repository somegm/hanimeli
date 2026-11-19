export const RECIPE_DETAILS: Record<
  string,
  {
    ingredients: string[];
    steps: string[];
    nutrition: { calories: number; protein: number; carbs: number; fat: number };
    dietTags: string[];
    requiredIngredientIds: string[];
    averageRating: number;
    ratingCount: number;
    cookCount: number;
  }
> = {
  '1': {
    ingredients: ['Kırmızı mercimek', 'Soğan', 'Havuç', 'Patates', 'Tereyağı', 'Un', 'Tuz'],
    steps: [
      'Mercimek, soğan, havuç ve patatesi yıkayın.',
      'Tencereye alıp üzerini geçecek kadar su ekleyin ve haşlayın.',
      'Blend ile pürüzsüz hale getirin.',
      'Tereyağı ve un ile ezoleme yapıp çorbaya ekleyin.',
    ],
    nutrition: { calories: 220, protein: 12, carbs: 32, fat: 5 },
    dietTags: ['vejetaryen'],
    requiredIngredientIds: ['mercimek', 'sogan'],
    averageRating: 4.7,
    ratingCount: 128,
    cookCount: 540,
  },
  '2': {
    ingredients: ['Tavuk but', 'Patates', 'Zeytinyağı', 'Kekik', 'Pul biber', 'Tuz'],
    steps: [
      'Tavuk ve patatesleri iri parçalar halinde doğrayın.',
      'Zeytinyağı ve baharatlarla karıştırın.',
      '200°C fırında 40 dakika pişirin.',
    ],
    nutrition: { calories: 380, protein: 28, carbs: 22, fat: 18 },
    dietTags: [],
    requiredIngredientIds: ['tavuk', 'patates'],
    averageRating: 4.5,
    ratingCount: 96,
    cookCount: 412,
  },
  '3': {
    ingredients: ['Süt', 'Pirinç', 'Şeker', 'Nişasta', 'Yumurta', 'Tarçın'],
    steps: [
      'Pirinci sütte haşlayın.',
      'Şeker ve nişastayı ekleyip koyulaştırın.',
      'Fırın kabına alıp üzerini kızartın.',
      'Soğuduktan sonra tarçın serpin.',
    ],
    nutrition: { calories: 290, protein: 8, carbs: 48, fat: 7 },
    dietTags: ['vejetaryen'],
    requiredIngredientIds: ['sut'],
    averageRating: 4.8,
    ratingCount: 210,
    cookCount: 680,
  },
  '4': {
    ingredients: ['Yumurta', 'Domates', 'Biber', 'Soğan', 'Tereyağı', 'Tuz'],
    steps: [
      'Soğan ve biberi kavurun.',
      'Domatesi ekleyip pişirin.',
      'Yumurtaları kırıp karıştırarak pişirin.',
    ],
    nutrition: { calories: 180, protein: 11, carbs: 8, fat: 12 },
    dietTags: ['vejetaryen'],
    requiredIngredientIds: ['yumurta', 'domates', 'biber', 'sogan'],
    averageRating: 4.6,
    ratingCount: 305,
    cookCount: 890,
  },
  '5': {
    ingredients: ['Patlıcan', 'Kıyma', 'Domates', 'Soğan', 'Sarımsak', 'Zeytinyağı'],
    steps: [
      'Patlıcanları kızartın ve ortadan yarın.',
      'Kıymalı harcı hazırlayın.',
      'Patlıcanlara doldurup domates sosuyla fırınlayın.',
    ],
    nutrition: { calories: 340, protein: 18, carbs: 16, fat: 22 },
    dietTags: [],
    requiredIngredientIds: ['patlican', 'domates', 'sogan'],
    averageRating: 4.4,
    ratingCount: 87,
    cookCount: 256,
  },
};
