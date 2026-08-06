import { useCallback, useEffect, useState } from 'react';
import { FavoriteMessageRef } from '../types';
import * as favoritesStorage from '../storage/favoritesStorage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMessageRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const stored = await favoritesStorage.getFavorites();
    setFavorites(stored);
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const removeFavorite = useCallback(async (messageId: string) => {
    setFavorites((prev) => prev.filter((f) => f.messageId !== messageId));
    await favoritesStorage.removeFavorite(messageId);
  }, []);

  return { favorites, isLoading, refresh: load, removeFavorite };
}
