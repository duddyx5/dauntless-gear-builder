// Utility to generate or retrieve a persistent voter identifier.
// Stores a UUID in localStorage under 'dauntless_builder_voter_id'.

export function getVoterId(): string {
  const key = 'dauntless_builder_voter_id';
  let id = localStorage.getItem(key);
  if (!id) {
    // simple UUID v4 generator (not cryptographically secure but sufficient for deduplication)
    id = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
    try {
      localStorage.setItem(key, id);
    } catch (_) {}
  }
  return id;
}
