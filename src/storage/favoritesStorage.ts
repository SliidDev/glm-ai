import { FavoriteMessageRef } from '../types';
import { StorageKeys } from './storageKeys';
import { readJSON, writeJSON } from './storage';

export async function getFavorites(): Promise<FavoriteMessageRef[]> {
  const favorites = await readJSON<FavoriteMessageRef[]>(StorageKeys.favorites, []);
  return [...favorites].sort((a, b) => b.createdAt - a.createdAt);
}

export async function addFavorite(ref: FavoriteMessageRef): Promise<void> {
  const favorites = await readJSON<FavoriteMessageRef[]>(StorageKeys.favorites, []);
  if (favorites.some((f) => f.messageId === ref.messageId)) return;
  favorites.push(ref);
  await writeJSON(StorageKeys.favorites, favorites);
}

export async function removeFavorite(messageId: string): Promise<void> {
  const favorites = await readJSON<FavoriteMessageRef[]>(StorageKeys.favorites, []);
  await writeJSON(
    StorageKeys.favorites,
    favorites.filter((f) => f.messageId !== messageId)
  );
}

export async function isFavorite(messageId: string): Promise<boolean> {
  const favorites = await readJSON<FavoriteMessageRef[]>(StorageKeys.favorites, []);
  return favorites.some((f) => f.messageId === messageId);
}
