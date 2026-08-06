import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Chat, ChatMessage, ExportedChatFile } from '../types';
import { generateId } from '../utils/id';

export type ImportOutcome =
  | { status: 'success'; chat: Chat; messages: ChatMessage[] }
  | { status: 'cancelled' }
  | { status: 'invalid' };

function isValidExportedChatFile(value: unknown): value is ExportedChatFile {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.app !== 'GREX AI' || v.exportVersion !== 1) return false;
  if (!v.chat || typeof v.chat !== 'object') return false;
  if (!Array.isArray(v.messages)) return false;
  const chat = v.chat as Record<string, unknown>;
  if (typeof chat.title !== 'string') return false;
  return v.messages.every((m) => {
    const msg = m as Record<string, unknown>;
    return (
      typeof msg === 'object' &&
      msg !== null &&
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.content === 'string'
    );
  });
}

/** Opens the system file picker, reads the chosen JSON file, and
 * validates it matches GREX AI's export shape. IDs are regenerated on
 * import (both for the chat and every message) so importing the same
 * file twice — or a file exported from another device — never
 * collides with an existing chat. Favorite flags are intentionally
 * reset: the favorites list is keyed by message id, and those ids no
 * longer exist after re-keying, so silently reviving stale favorite
 * entries would be more surprising than starting clean. */
export async function importChatFromFile(): Promise<ImportOutcome> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.[0]) {
    return { status: 'cancelled' };
  }

  try {
    const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const parsed = JSON.parse(raw);

    if (!isValidExportedChatFile(parsed)) {
      return { status: 'invalid' };
    }

    const newChatId = generateId('chat');
    const now = Date.now();

    const chat: Chat = {
      id: newChatId,
      title: parsed.chat.title,
      createdAt: parsed.chat.createdAt ?? now,
      updatedAt: now,
      pinned: false,
      lastMessagePreview: parsed.chat.lastMessagePreview ?? '',
    };

    const messages: ChatMessage[] = parsed.messages.map((m) => ({
      id: generateId('msg'),
      chatId: newChatId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt ?? now,
      status: 'sent',
      isFavorite: false,
    }));

    return { status: 'success', chat, messages };
  } catch (err) {
    console.warn('[importService] failed to import file', err);
    return { status: 'invalid' };
  }
}
