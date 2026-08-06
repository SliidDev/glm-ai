import { postJSON, ApiTimeoutError, ApiAbortedError, ApiNetworkError } from './apiClient';
import { AI_ENDPOINT } from '../constants/config';
import { AiApiRequestBody, AiApiResponse, AppSettings, SendResult } from '../types';

/**
 * Sends one message to GREX API's /api/ai/nvidia route.
 *
 * The endpoint returns a single complete JSON payload — it is not a
 * token stream — so there is nothing to consume incrementally here.
 * The chat-facing "streaming" effect (see hooks/useChatMessages.ts)
 * is a client-side reveal animation played over this already-complete
 * `reply` string. If your GREX API deployment ever adds real
 * chunked/SSE streaming to this route, this is the one function that
 * would change shape — everything downstream already just consumes a
 * final string.
 */
export async function sendMessage(
  message: string,
  settings: Pick<AppSettings, 'model' | 'temperature' | 'maxTokens'>,
  signal?: AbortSignal
): Promise<SendResult> {
  const body: AiApiRequestBody = {
    message,
    model: settings.model,
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
  };

  try {
    const data = await postJSON<AiApiResponse>(AI_ENDPOINT, body, { externalSignal: signal });

    if (data.status && typeof data.reply === 'string') {
      return { ok: true, reply: data.reply, creator: data.creator };
    }

    // status is false, or the shape is unexpected — the spec only
    // documents the success shape, so we defensively fall back
    // through a few plausible error-message fields before giving up.
    return {
      ok: false,
      aborted: false,
      errorMessage: data.message || data.error || 'errors.apiError',
    };
  } catch (err) {
    if (err instanceof ApiAbortedError) {
      return { ok: false, aborted: true, errorMessage: '' };
    }
    if (err instanceof ApiTimeoutError) {
      return { ok: false, aborted: false, errorMessage: 'errors.timeout' };
    }
    if (err instanceof ApiNetworkError) {
      return { ok: false, aborted: false, errorMessage: 'errors.network' };
    }
    return { ok: false, aborted: false, errorMessage: 'errors.unknown' };
  }
}
