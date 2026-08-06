import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Chat, ChatMessage, ExportedChatFile } from '../types';
import { EXPORT_FILE_PREFIX } from '../constants/config';

function sanitizeFileNamePart(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\-_ ]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
}

/** Writes the chat to a JSON file in the app's document directory and
 * opens the native share sheet for it. Returns false (without
 * throwing) if sharing isn't available on this platform/build, so
 * the caller can show a friendly toast instead of crashing. */
export async function exportChatToFile(chat: Chat, messages: ChatMessage[]): Promise<boolean> {
  const payload: ExportedChatFile = {
    app: 'GREX AI',
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    chat,
    messages,
  };

  const fileName = `${EXPORT_FILE_PREFIX}-${sanitizeFileNamePart(chat.title) || 'chat'}.json`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return false;

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: chat.title,
  });
  return true;
}
