// App-wide constants that aren't design tokens or copy.
// Centralized here so nothing else in the codebase hardcodes a URL,
// a timeout, or a storage schema version.

export const API_BASE_URL = 'https://grex-api.vercel.app';
export const AI_ENDPOINT = `${API_BASE_URL}/api/ai/nvidia`;

// The backend returns a single JSON payload rather than a token
// stream (see src/api/apiClient.ts for the exact contract). If your
// GREX API deployment starts supporting real Server-Sent Events for
// this route, apiClient.sendMessage is the only place that needs to
// change — everything above it already works against a plain string.
export const REQUEST_TIMEOUT_MS = 45_000;

// Purely cosmetic: how fast the already-received reply is revealed
// on screen, in characters per animation tick.
export const TYPEWRITER_TICK_MS = 18;
export const TYPEWRITER_CHARS_PER_TICK = 2;

export const APP_NAME = 'GREX AI';
export const APP_CREATOR = 'غريكس';

export const STORAGE_VERSION = 'v1';

export const DEFAULT_SETTINGS_MODEL = 'z-ai/glm-5.2';
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 1000;

export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 1.5;
export const MIN_MAX_TOKENS = 200;
export const MAX_MAX_TOKENS = 4000;

export const EXPORT_FILE_PREFIX = 'grex-ai-chat';
