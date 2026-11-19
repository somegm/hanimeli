import { randomUUID } from 'crypto';

import { env } from '../../config/env';
import type {
  AiRecipeResponse,
  GeneratedRecipe,
  PantryIngredientInput,
  RawAiRecipe,
} from './types';

const RECIPE_COUNT = 3;

function buildPrompt(ingredients: PantryIngredientInput[]): string {
  const names = ingredients.map((item) => item.name).join(', ');

  return `Sen Türk mutfağı konusunda uzman bir şefsin. Kullanıcının evinde şu malzemeler var: ${names}.

Bu malzemeleri temel alarak ${RECIPE_COUNT} farklı, pratik ve lezzetli tarif öner. Tarifler gerçekçi olsun; kullanıcının seçtiği malzemeleri mutlaka kullan. Eksik malzemeler için sadece evde yaygın bulunan temel malzemeler (tuz, karabiber, zeytinyağı, un, süt vb.) ekleyebilirsin.

Yanıtı yalnızca aşağıdaki JSON formatında ver, başka metin ekleme:
{
  "recipes": [
    {
      "title": "Tarif adı",
      "description": "Kısa açıklama (1-2 cümle)",
      "prepTimeMinutes": 25,
      "ingredients": ["malzeme 1", "malzeme 2"],
      "steps": ["adım 1", "adım 2"],
      "usedPantryIngredients": ["Kullanılan seçili malzeme adları"]
    }
  ]
}

usedPantryIngredients alanına yalnızca kullanıcının verdiği malzeme adlarından kullandıklarını yaz: ${names}`;
}

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase('tr');
}

function mapToGeneratedRecipes(
  rawRecipes: RawAiRecipe[],
  pantryIngredients: PantryIngredientInput[],
): GeneratedRecipe[] {
  const nameToId = new Map(
    pantryIngredients.map((item) => [normalizeName(item.name), item.id]),
  );

  return rawRecipes.slice(0, RECIPE_COUNT).map((recipe) => {
    const matchedIngredients = recipe.usedPantryIngredients
      .map((name) => nameToId.get(normalizeName(name)))
      .filter((id): id is string => Boolean(id));

    return {
      id: `ai-${randomUUID()}`,
      title: recipe.title.trim(),
      description: recipe.description.trim(),
      prepTimeMinutes: Math.max(5, Math.round(recipe.prepTimeMinutes)),
      ingredients: recipe.ingredients.map((item) => item.trim()).filter(Boolean),
      steps: recipe.steps.map((item) => item.trim()).filter(Boolean),
      matchedIngredients: [...new Set(matchedIngredients)],
    };
  });
}

function parseAiResponse(text: string): RawAiRecipe[] {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned) as AiRecipeResponse;

  if (!Array.isArray(parsed.recipes) || parsed.recipes.length === 0) {
    throw new Error('AI_EMPTY_RESPONSE');
  }

  return parsed.recipes.filter(
    (recipe) =>
      recipe.title &&
      recipe.description &&
      Array.isArray(recipe.ingredients) &&
      Array.isArray(recipe.steps),
  );
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GEMINI_API_ERROR: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('AI_EMPTY_RESPONSE');
  }

  return text;
}

async function callOpenAi(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Sen Türk mutfağı uzmanı bir şefsin. Yanıtlarını yalnızca istenen JSON formatında ver.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OPENAI_API_ERROR: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('AI_EMPTY_RESPONSE');
  }

  return text;
}

async function callAiProvider(prompt: string): Promise<string> {
  if (env.geminiApiKey) {
    return callGemini(prompt);
  }

  if (env.openaiApiKey) {
    return callOpenAi(prompt);
  }

  throw new Error('AI_API_KEY_NOT_CONFIGURED');
}

export async function generateRecipesWithAi(
  ingredients: PantryIngredientInput[],
): Promise<GeneratedRecipe[]> {
  if (ingredients.length < 2) {
    throw new Error('INSUFFICIENT_INGREDIENTS');
  }

  const prompt = buildPrompt(ingredients);
  const rawText = await callAiProvider(prompt);
  const rawRecipes = parseAiResponse(rawText);

  if (rawRecipes.length === 0) {
    throw new Error('AI_EMPTY_RESPONSE');
  }

  return mapToGeneratedRecipes(rawRecipes, ingredients);
}
