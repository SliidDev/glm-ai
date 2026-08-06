# GREX AI

A premium, bilingual (Arabic/English, RTL-first) AI chat client for React Native + Expo, built against the GREX API's `/api/ai/nvidia` endpoint.

---

## 1. Before you run it

This project was written file-by-file in a sandboxed environment with **no network access** — `npm install` was never run against it, and no TypeScript compiler or Metro bundler ever checked it. Every file was written carefully and cross-checked with automated scripts (see `scripts/check_imports.py` and `scripts/check_exports.py`, kept in the repo — run them any time after refactors), but "carefully hand-written" is not the same guarantee as "compiled and run." Budget a first debugging pass, the way you would for any large piece of code you're seeing run for the first time — most likely candidates for a hiccup are exact `react-native-markdown-display` prop names and package version drift (see §6).

## 2. Quick start

```bash
npm install
npx expo install --fix   # reconciles every package.json version against the Expo SDK
npx expo start
```

Scan the QR code with **Expo Go** (this targets **Expo SDK 54** specifically — during SDK 57's rollout, Expo Go on app stores tracks SDK 54, so this is the version that will actually open in Expo Go on your phone today; see §6).

Before your first real build, replace the placeholder identifiers in `app.json` (`ios.bundleIdentifier`, `android.package` — currently `com.grex.grexai`) with your own.

## 3. What's implemented

Every feature in the original brief is implemented in working code — nothing is a stub. A few needed a deliberate engineering decision because the brief didn't (and couldn't) pin down every detail; those are called out inline below and explained fully in §6.

- Animated splash → onboarding (4 slides) → home
- Multiple chats: create, rename, delete, pin, search (with match highlighting)
- Streaming-*style* typing animation, stop/regenerate, markdown + syntax-highlighted code blocks, copy/share/favorite, timestamps, auto-scroll, typing indicator
- Error handling with retry, loading skeletons, pull-to-refresh, offline detection
- Settings: model picker (+ custom model id), temperature & max-tokens sliders, theme (dark/light/system), language (AR/EN) with a correct RTL-reload flow, haptics toggle
- Export / import a conversation as JSON, clear all history, reset settings
- Favorites screen across all chats, prompt templates + recent-prompt history
- Tablet/responsive-safe layouts, accessibility labels throughout, reduced-motion support, haptic feedback, keyboard-avoiding input

## 4. Project structure

```
app/                      expo-router routes — thin, each one just renders a screen from src/screens
  _layout.tsx              root layout: fonts, RTL bootstrap, providers, Stack
  index.tsx                splash → decides onboarding vs. home
  onboarding.tsx
  home.tsx
  chat/[id].tsx             "id" is a real generated id, not a magic "new" string — see §6
  settings.tsx
  favorites.tsx
  +not-found.tsx
src/
  api/                     network layer
  components/              common/, home/, chat/, settings/ — presentational, reusable
  constants/                theme tokens, i18n dictionaries, model list, prompt templates, config
  context/                 SettingsContext, ChatsContext, ToastContext
  hooks/                    everything else (translation, theme, network, haptics, the chat engine…)
  navigation/               centralized route-path builders
  screens/                  the actual screen implementations (app/ just wires these to routes)
  services/                 framework-agnostic domain logic (chat factories, export, import)
  storage/                  typed AsyncStorage wrappers, one module per data type
  types/                    every shared TypeScript interface
  utils/                    small, single-purpose helpers
assets/images/              generated app icon / splash / adaptive icon / favicon (see §7)
scripts/                    asset generator + the two import/export sanity checkers used while building
```

## 5. File-by-file guide

### `app/` — routing only
| File | What it does |
|---|---|
| `_layout.tsx` | Loads fonts, reads settings once, runs the RTL bootstrap (reloads the app if the saved language needs a different text direction than the OS currently has), then mounts `SettingsProvider → ToastProvider → ChatsProvider` and the `Stack`. |
| `index.tsx` | Renders the splash screen; waits for both its minimum display animation *and* the "has onboarded" check before routing. |
| `onboarding.tsx` | Marks onboarding complete in storage, then replaces to `/home`. |
| `home.tsx`, `settings.tsx`, `favorites.tsx` | One line each — render the matching screen. |
| `chat/[id].tsx` | Same — renders `ChatScreen`, which reads `id` itself via `useLocalSearchParams`. |
| `+not-found.tsx` | expo-router's catch-all for an unmatched deep link. |

### `src/types/index.ts`
Every shared shape (`Chat`, `ChatMessage`, `AppSettings`, the API request/response contract, `SendResult`, etc.). Everything else in the app imports its types from here — nothing redefines a shape locally.

### `src/constants/`
| File | What it does |
|---|---|
| `config.ts` | The GREX API URL, request timeout, typewriter speed, default settings values. Change the endpoint or defaults here and nowhere else needs to know. |
| `theme.ts` | Dark + light color palettes, spacing/radius/type scale, and the code-block syntax-highlight palette. The design plan is written as a comment at the top. |
| `models.ts` | The model picker's list. Only `z-ai/glm-5.2` is confirmed by your spec — the rest are plausible NVIDIA-catalog-style placeholders meant as a starting point, **not a guarantee of what your backend supports**. Edit freely; the settings screen also accepts a typed-in custom model id for exactly this reason. |
| `promptTemplates.ts` | Template ids + icons; the actual bilingual text lives in `i18n/`. |
| `i18n/en.ts`, `i18n/ar.ts`, `i18n/index.ts` | Every string in the app, in both languages, same key structure in both files (checked at runtime in dev — see `useTranslation.ts`). |

### `src/storage/`
| File | What it does |
|---|---|
| `storage.ts` | Generic typed `readJSON`/`writeJSON`/`remove` wrapper around AsyncStorage with error handling, so no other file touches AsyncStorage directly. |
| `storageKeys.ts` | Every storage key, versioned (`/v1`), in one place. |
| `chatStorage.ts` | Chat list + per-chat messages. |
| `settingsStorage.ts` | Settings, with `DEFAULT_SETTINGS` merged onto whatever's stored so a future new field is never `undefined` for existing users. |
| `favoritesStorage.ts`, `promptHistoryStorage.ts` | As named. |

### `src/api/`
| File | What it does |
|---|---|
| `apiClient.ts` | Generic `postJSON` — combines an internal timeout with an external `AbortSignal` (for the Stop button) into one fetch call, and classifies the failure (timeout vs. user-abort vs. network) for the caller. |
| `aiService.ts` | GREX-specific: builds the exact request body from your spec, calls `apiClient`, and normalizes the result into `SendResult`. This is the one function to change if your backend's contract ever changes. |

### `src/services/` (framework-agnostic — no React here)
| File | What it does |
|---|---|
| `chatService.ts` | Chat/message factory functions, chat-title derivation from the first message, list-preview text, search filtering. |
| `exportService.ts` | Writes a chat to a JSON file (`expo-file-system`) and opens the share sheet (`expo-sharing`). |
| `importService.ts` | Opens the file picker, validates the JSON shape, and regenerates ids on import (see §6 for why). |

### `src/context/`
`SettingsContext` (the single source of truth for `AppSettings`, persisted on every change), `ChatsContext` (chat-list metadata + CRUD), `ToastContext` (brief on-screen confirmations). All three are plain Context + `useState`, no external state library — there isn't enough global state here to need one.

### `src/hooks/`
| File | What it does |
|---|---|
| `useChatMessages.ts` | The chat engine: loads/persists one chat's messages and orchestrates send / regenerate / retry / stop / favorite against `aiService` + storage. This is the file to read first to understand how a message actually gets sent. |
| `useTypewriter.ts` | The reveal animation for the currently-streaming message — reacts to an external "stop" signal declaratively instead of exposing an imperative method across component boundaries. |
| `useTranslation.ts`, `useTheme.ts` | Thin hooks over `SettingsContext` resolving the current language/theme into ready-to-use values. |
| `useNetworkStatus.ts`, `useHaptics.ts`, `useReducedMotion.ts` | Thin wrappers over NetInfo / expo-haptics / the OS accessibility setting. |
| `useFavorites.ts`, `usePromptHistory.ts` | Load + mutate their respective storage modules. |

### `src/components/common/`
Generic, reusable, no chat-specific knowledge: `Button`, `TextField`, `ConfirmDialog`, `ActionSheet` (one shared bottom-sheet primitive used for both chat-list-item actions and message actions), `EmptyState`, `Skeleton`, `OfflineBanner`, `ToastView`, `Logo` (the brand "orb" mark — see §6), `ErrorBoundary` (the one class component in the codebase; React requires error boundaries to be classes).

### `src/components/home/`, `src/components/chat/`, `src/components/settings/`
Feature-specific building blocks — `ChatListItem` (swipe actions + search highlighting), `MessageBubble` (the biggest one: role-based layout, the streaming reveal, error/retry state, inline actions), `MarkdownMessage` + `CodeBlock` (markdown rendering with a custom syntax highlighter routed in via `react-native-markdown-display`'s `rules` prop), `ChatInput`, `PromptTemplates` (both the compact chip row and the full sheet, sharing one data source), `SettingsPrimitives`/`SliderSetting`/`ModelSelectorModal`/`SettingsPickers`.

### `src/screens/`
The real screen implementations — `app/*.tsx` files are one-line wrappers around these. `ChatScreen.tsx` is the most involved: it owns the FlatList's "smart auto-scroll" (only follows new content if the person was already near the bottom) and wires every dialog/sheet the chat screen can open.

### `src/utils/`
Small, single-purpose: `id.ts` (id generation), `dateFormat.ts` (hand-rolled AR/EN time formatting — see §6), `clipboard.ts`, `share.ts`, `validators.ts`, `errorMessages.ts` (resolves an error into display text whether it's one of our own i18n keys or a raw string from the API), `rtl.ts` (the RTL-reload bootstrap), `syntaxHighlight.ts` (the code tokenizer).

## 6. Decisions worth knowing about

**"Streaming" is a client-side reveal, not real token streaming.** Your spec's endpoint returns one complete JSON response, not a chunked/SSE stream — so there is nothing to consume incrementally. `aiService.sendMessage` waits for the full `reply`, and `useTypewriter` reveals it progressively purely as an on-screen animation. Tapping Stop mid-reveal freezes the animation and keeps *only* what's currently on screen (matching what people expect "stop" to mean), even though the rest of the text was technically already received. If GREX API ever grows real streaming on this route, `aiService.ts` is the only file whose insides would need to change.

**Icons: `@expo/vector-icons` instead of `react-native-vector-icons`.** The latter needs manual native linking/config outside of Expo's managed workflow; `@expo/vector-icons` ships the same icon sets (Ionicons throughout, for one consistent visual language) pre-linked for Expo. Swapping it back is a find-and-replace on the import path if you have a reason to.

**Code syntax highlighting is a small custom tokenizer (`utils/syntaxHighlight.ts`)**, not a full Prism/highlight.js port. Those are heavy and occasionally fragile in RN. The tokenizer handles comments/strings/numbers/keywords/functions across the common C-like/Python/shell family well enough for chat-sized snippets; it won't be perfectly correct for every language's edge cases (e.g. it can mis-color a CSS `#id-selector` as a comment). The code-block chrome (dark terminal window with three dots) is a deliberate nod to a terminal aesthetic inside an otherwise ChatGPT/Claude-style bubble UI.

**`react-native-highlight-words`** is used for what it's actually for — highlighting the matched substring in a chat title while searching (`ChatListItem`) — rather than for code, which is a different problem solved by the tokenizer above.

**RTL is handled properly, not just mirrored.** Arabic is the default and the app boots already in RTL. Switching language at runtime calls `I18nManager.forceRTL` and reloads the app via `expo-updates` (`utils/rtl.ts`) — React Native genuinely requires a fresh reload for a direction change to reach the native view tree; anything that claims otherwise is glossing over it. Layout throughout uses logical properties (`marginStart`/`end`, `flex-start`/`end`, `textAlign: 'auto'`) rather than hardcoded left/right, except inside code blocks, which are intentionally forced LTR since code direction doesn't follow prose language.

**New chats aren't pre-created.** Tapping "New chat" generates a real id and navigates straight to `/chat/{id}`; nothing is written to the chat list until the first message actually sends. `useChatMessages` detects "this chat has no metadata yet" and creates it at that point, using that same id — no placeholder/"new" sentinel value anywhere, no URL rewrite needed.

**Import regenerates every id.** An imported chat and its messages get fresh ids on the way in, so importing the same file twice — or a file from another device — can never collide with something already on this device. Favorite flags reset on import for the same reason: the favorites list is keyed by message id, and reviving stale favorite entries under new ids would be more surprising than starting clean.

**Dates are hand-rolled, not `Intl`.** Hermes' ICU/`Intl` locale data completeness has historically varied across RN versions and build configurations; `dateFormat.ts` hand-formats "Today"/"Yesterday"/time/month names in both languages so this doesn't depend on it.

**Blur is deliberately avoided.** Everything that looks like a translucent panel (the offline banner, toasts, sheets) uses a solid theme color rather than `expo-blur`, since blur views can repaint poorly and flash on some Android devices. Same reasoning kept `expo-linear-gradient` out — nowhere in this build needed it badly enough to justify the risk of it looking inconsistent across devices untested.

**Target: Expo SDK 54, not the newest tag.** At the time this was built, SDK 57 was mid-rollout and Expo Go on app stores was still serving SDK 54 — the version that will actually preview correctly on a phone via Expo Go today. Re-check `npx expo install --fix` and the Expo Go app's supported SDK before assuming a newer SDK is the right move.

## 7. Assets

`assets/images/*.png` are generated (see `scripts/generate_assets.py`, uses Pillow) — an original radial-gradient "orb" mark, not sourced from anywhere. They're placeholders in the sense that you'll likely want your own branded icon eventually, but they're real, finished PNGs at the correct sizes (1024×1024 icon/adaptive-icon-foreground, 768×768 splash, 196×196 favicon) and `app.json` already points at them — the app is installable as-is. The same mark is also drawn live as an SVG component (`components/common/Logo.tsx`) for in-app use (splash animation, AI avatar, typing indicator), so none of the *running app's* UI depends on the PNGs — only the OS-level icon/splash do.

## 8. Storage

Everything is local-only, versioned under `@grex_ai/*/v1` keys in AsyncStorage (see `storage/storageKeys.ts`) — chats, messages per chat, settings, favorites, and prompt history. There's no backend account system; export/import (JSON files) is the only way data moves between devices.
