// Centralized route paths for expo-router's imperative navigation
// (router.push / router.replace). Keeping every path string here
// means a route rename is a one-file change instead of a grep across
// every screen that links to it.

export const Routes = {
  onboarding: '/onboarding' as const,
  home: '/home' as const,
  settings: '/settings' as const,
  favorites: '/favorites' as const,
  chat: (id: string) => ({ pathname: '/chat/[id]' as const, params: { id } }),
};
