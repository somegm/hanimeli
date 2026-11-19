# Project Overview: Security-First & High-Performance Development Rules

This project is a mobile application built using **React Native** and **Expo**, backed by a **Node.js + MongoDB** API. **Security** and **Optimization/Performance** are the highest priorities in this codebase. Every feature, component, and API integration must be designed and implemented with these twin pillars in mind.

---

## 1. Core Security Guarantees & Code Patterns

When generating or refactoring code, strictly adhere to the following security protocols:

### A. Sensitive Data & Storage
* **No Plaintext Secrets:** Never store sensitive data (tokens, passwords, PII, keys) in standard `AsyncStorage`.
* **Secure Storage:** Always use `expo-secure-store` for sensitive key-value pairs (e.g., Auth Tokens, Refresh Tokens, Guest User ID).
* **Environment Variables:** Securely inject build-time configuration using Expo's native `process.env` or approved env handlers. Never commit `.env` files or hardcode API keys.
* **No Local Business Data:** Tarifler, indirimler, alışveriş listeleri, fiyat takibi ve diğer iş verileri **AsyncStorage'da tutulmaz**. Tüm kalıcı veri MongoDB'de saklanır; mobil uygulama yalnızca API üzerinden okur/yazar.

### B. Network & API Security
* **HTTPS Only (Production):** Production ortamında tüm istekler HTTPS üzerinden yapılmalıdır. Geliştirme ortamında `http://localhost` kabul edilir.
* **Request Sanitization:** Validate and sanitize all inputs before sending them to the backend to mitigate injection risks.
* **User Identity Header:** Kullanıcıya özel endpoint'ler `X-User-Id` header'ı ile çağrılır. Bu ID `expo-secure-store` içinde tutulur.

### C. Component & Runtime Security
* **Deep Linking Vulnerabilities:** Validate all incoming parameters from Deep Links (`expo-linking`). Treat incoming URLs as untrusted input.
* **WebView Restrictions:** When using WebViews, strictly disable unnecessary features (`allowFileAccess`, `allowUniversalAccessFromFileURLs`) and restrict JavaScript execution to trusted domains only.

---

## 2. Optimization & Performance Guidelines

To ensure a solid 60/120 FPS user experience and minimal resource consumption, enforce the following optimization patterns:

### A. Rendering & Component Optimization
* **Avoid Unnecessary Re-renders:** Memorize complex computations using `useMemo` and callbacks passed as props using `useCallback`.
* **Component Memoization:** Use `React.memo` judiciously for expensive list items or static UI components that receive stable props.
* **Inline Functions & Objects:** Avoid declaring functions or object literals directly inside JSX props (e.g., `style={{ margin: 10 }}` or `onPress={() => doSomething()}`) as they create new references on every render. Use stylesheet objects and structured hooks instead.

### B. List Performance (Crucial)
* **FlatList / FlashList:** Never render large dynamic lists using `.map()`. Use `FlatList` or Shopify's `@shopify/flash-list` for highly optimized memory recycling.
* **List Item Optimization:** Ensure list items have a unique, stable `keyExtractor`. Keep item components lightweight and decouple them from complex heavy logic.
* **Image Optimization:** Always use optimized image components (like `expo-image`) instead of the default React Native `Image`. Enforce aggressive caching, explicit sizing, and proper resolution matching to save memory and bandwidth.

### C. State & Bundle Management
* **Colocate State:** Keep state as close to where it is used as possible. Avoid lifting state globally if it only affects a small leaf component (to prevent global re-render trees).
* **Bundle Size Control:** Import specific methods from libraries rather than full packages where possible (tree-shaking). Avoid adding bloated, unoptimized third-party packages.

---

## 3. General Tech Stack & Architectural Guidelines

* **Mobile:** React Native via Expo (Managed Workflow with EAS Build).
* **Backend:** Node.js + Express + Mongoose → MongoDB.
* **Language:** TypeScript (Strict mode enabled. No `any` types allowed).
* **Styling:** Use `StyleSheet.create` for native optimization, or a performance-first utility engine (like NativeWind/Tailwind) ensuring zero runtime overhead.

---

## 4. MongoDB Data Architecture (Zorunlu)

Tüm iş verisi MongoDB'de tutulur. Mobil uygulama **doğrudan veritabanına bağlanmaz**; `server/` altındaki REST API üzerinden erişir.

### A. Koleksiyonlar

| Koleksiyon | Tür | Açıklama |
|---|---|---|
| `recipes` | Katalog | Tarifler (`isDailyPick` ile günlük seçim) |
| `discounts` | Katalog | Market indirimleri |
| `products` | Katalog | Fiyat karşılaştırma ürünleri + market fiyatları |
| `cookingtips` | Katalog | Mutfak ipuçları |
| `pantryingredients` | Katalog | Dolap malzemeleri |
| `pantryrecipetemplates` | Katalog | Malzeme eşleştirmeli AI tarif şablonları |
| `weeklymenus` | Katalog | Haftalık menü + alışveriş malzemeleri |
| `users` | Kullanıcı | Misafir/kayıtlı kullanıcı kimliği (`externalId`) |
| `trackedproducts` | Kullanıcı | Ürün fiyat takibi ve alarm tercihleri |
| `shoppinglists` | Kullanıcı | Paylaşımlı alışveriş listeleri |

### B. Veri Ayrımı

* **Katalog verisi:** Tüm kullanıcılar için ortak. Sunucu tarafından yönetilir, seed ile doldurulur.
* **Kullanıcı verisi:** `userId` (mobil: `X-User-Id` header) ile izole edilir. Alışveriş listeleri ve fiyat takibi bu şekilde saklanır.
* **Cihazda sadece:** Oturum kimliği (`guest_user_id`) ve auth token'ları (`expo-secure-store`).

### C. API Yapısı (`server/src/routes/`)

```
GET  /api/recipes
GET  /api/recipes/daily
GET  /api/discounts
GET  /api/products
GET  /api/tips?category=
GET  /api/pantry/ingredients
POST /api/pantry/recipes          { ingredientIds: string[] }
GET  /api/menus/current

GET  /api/tracking                (auth)
PATCH /api/tracking/:id/alert     (auth)
PATCH /api/tracking/:id/target-price (auth)
POST /api/tracking/:id/simulate-drop (auth)

GET  /api/shopping/lists          (auth)
POST /api/shopping/lists          (auth)
PATCH /api/shopping/lists/:listId/items/:itemId (auth)
POST /api/shopping/lists/:listId/items (auth)
POST /api/shopping/lists/:listId/import (auth)
```

### D. Mobil Katman (`src/services/api/`)

* `client.ts` — Ortak `fetch` wrapper, `EXPO_PUBLIC_API_URL`, `X-User-Id` enjeksiyonu
* `catalogApi.ts` — Tarif ve indirim endpoint'leri
* `trackingApi.ts` — Ürün karşılaştırma ve fiyat takibi
* `shoppingApi.ts` — Alışveriş listesi CRUD
* `contentApi.ts` — İpuçları, dolap, haftalık menü

Yeni veri eklerken:
1. Önce MongoDB modeli + route ekle (`server/`)
2. Seed verisini `server/src/seed/data.ts` içine koy
3. Mobil tipe (`src/types/`) ve API servisine ekle
4. Ekranda `useApiData` veya `AppContext` üzerinden tüket

### E. Geliştirme Ortamı

```bash
# 1. MongoDB çalışıyor olmalı (localhost:27017)
cd server && npm install && npm run dev

# 2. Mobil uygulama
# .env dosyasında EXPO_PUBLIC_API_URL ayarla
npm start
```

İlk sunucu açılışında katalog koleksiyonları boşsa otomatik seed çalışır. Manuel seed: `cd server && npm run seed`.

### F. Yasaklı Kalıplar

* `src/constants/` altında mock iş verisi **oluşturma**
* `AsyncStorage` ile tarif, indirim, liste veya takip verisi **saklama**
* Ekranlarda doğrudan sabit dizi import etme — her zaman API servisi kullan
* MongoDB connection string'ini mobil bundle'a **gömme**

---

## 5. Cursor Instructions for Code Generation

* **Security & Performance Check:** Before outputting any code block, verify it does not violate security rules AND adheres to the performance patterns listed above (e.g., proper hook usage, optimized list structures).
* **MongoDB First:** Yeni özellik veya veri modeli istendiğinde önce MongoDB şeması ve API endpoint'i tasarla; ardından mobil entegrasyonu yap.
* **Proactive Warnings:** If a requested implementation introduces performance degradation (e.g., nested mapping, massive state re-renders), a security vulnerability, or local storage for business data, explicitly warn the developer and provide the optimized, secure alternative.
