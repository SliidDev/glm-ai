import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin, typed wrapper around AsyncStorage so every call site gets
// JSON parsing/stringifying and consistent error handling for free,
// instead of every feature re-implementing try/catch + JSON.parse.

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] failed to read "${key}"`, err);
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] failed to write "${key}"`, err);
    return false;
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] failed to remove "${key}"`, err);
  }
}

export async function removeMany(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (err) {
    console.warn('[storage] failed to remove keys', keys, err);
  }
}

export async function getAllKeysWithPrefix(prefix: string): Promise<string[]> {
  try {
    const all = await AsyncStorage.getAllKeys();
    return all.filter((k) => k.startsWith(prefix));
  } catch (err) {
    console.warn(`[storage] failed to list keys with prefix "${prefix}"`, err);
    return [];
  }
}
