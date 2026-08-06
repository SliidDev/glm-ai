import { StorageKeys } from './storageKeys';
import { readJSON, writeJSON } from './storage';

const MAX_HISTORY = 20;

export interface RecentPrompt {
  id: string;
  text: string;
  usedAt: number;
}

export async function getPromptHistory(): Promise<RecentPrompt[]> {
  return readJSON<RecentPrompt[]>(StorageKeys.promptHistory, []);
}

export async function addPromptToHistory(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  const history = await readJSON<RecentPrompt[]>(StorageKeys.promptHistory, []);
  const deduped = history.filter((p) => p.text !== trimmed);
  deduped.unshift({ id: `${Date.now()}`, text: trimmed, usedAt: Date.now() });
  await writeJSON(StorageKeys.promptHistory, deduped.slice(0, MAX_HISTORY));
}

export async function clearPromptHistory(): Promise<void> {
  await writeJSON(StorageKeys.promptHistory, []);
}
