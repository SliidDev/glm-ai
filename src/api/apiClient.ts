import { REQUEST_TIMEOUT_MS } from '../constants/config';

export class ApiTimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'ApiTimeoutError';
  }
}

export class ApiAbortedError extends Error {
  constructor() {
    super('Request was cancelled');
    this.name = 'ApiAbortedError';
  }
}

export class ApiNetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

interface PostJSONOptions {
  /** External signal (e.g. from a "stop generating" button) that
   * should cancel the request in addition to our own timeout. */
  externalSignal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * POSTs a JSON body and returns the parsed JSON response.
 *
 * Combines an internal timeout with an optional caller-provided
 * AbortSignal so both "the server took too long" and "the user
 * tapped stop" cancel the same in-flight fetch, and distinguishes
 * the two in the thrown error so callers can show the right message.
 */
export async function postJSON<TResponse>(
  url: string,
  body: unknown,
  options: PostJSONOptions = {}
): Promise<TResponse> {
  const { externalSignal, timeoutMs = REQUEST_TIMEOUT_MS } = options;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const onExternalAbort = () => timeoutController.abort();
  externalSignal?.addEventListener('abort', onExternalAbort);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      throw new ApiNetworkError(`HTTP ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (err) {
    if (err instanceof ApiNetworkError) throw err;

    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || err.name === 'ApiAbortedError');

    if (isAbort) {
      // timeoutController only ever gets aborted from two places: our
      // own timeout firing, or the caller's externalSignal firing (see
      // onExternalAbort above). If externalSignal is the one that's
      // marked aborted, that's what caused this — otherwise it was us.
      throw externalSignal?.aborted ? new ApiAbortedError() : new ApiTimeoutError();
    }

    throw new ApiNetworkError(err instanceof Error ? err.message : 'Unknown network error');
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}
