// Lightweight unique-id generator. We don't need cryptographic
// randomness for local-only chat/message ids, so a small
// timestamp+random string keeps the app dependency-free instead of
// pulling in a uuid package for this alone.
export function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}
