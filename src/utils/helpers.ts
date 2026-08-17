// Deterministic, evenly-spread avatar palette — picking by id (not randomly)
// means the same contact always gets the same color across renders/reloads.
const AVATAR_COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#EF4444', '#14B8A6', '#6366F1'];

/** Stable background color for a user's avatar circle, keyed off their id. */
export function colorForId(id: number | string): string {
  const n = typeof id === 'number' ? id : Array.from(String(id)).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

/** First letter of a display name for an avatar badge, uppercased. */
export function initialOf(name: string | null | undefined): string {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}
