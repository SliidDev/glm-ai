import { Share } from 'react-native';

/** Native share sheet for plain text (a single message). File-based
 * sharing (exporting a whole conversation) lives in
 * services/exportService.ts, which needs expo-sharing + a real file
 * on disk — this one just needs the RN core Share API. */
export async function shareText(message: string): Promise<boolean> {
  try {
    const result = await Share.share({ message });
    return result.action === Share.sharedAction;
  } catch (err) {
    console.warn('[share] failed', err);
    return false;
  }
}
