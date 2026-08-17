// All message/notification timestamps from the backend are UTC (Postgres
// TIMESTAMPTZ / "NOW() AT TIME ZONE 'UTC'" — see messageController.js). The
// app's users are in Sri Lanka, so every formatter here pins its output to
// Asia/Colombo regardless of the viewer's own machine/browser timezone,
// rather than relying on the browser's local timezone (which would silently
// show the wrong time for anyone testing from outside Sri Lanka).
const COLOMBO_TZ = 'Asia/Colombo';

/** "2:34 PM" in Sri Lankan local time — used under each chat bubble. */
export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: COLOMBO_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Relative time ("Just now", "5m ago", "3h ago", "2d ago") for recent
 * activity, falling back to an absolute Sri Lankan date once it's old enough
 * that "N days ago" stops being useful (matches WhatsApp-style conventions).
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return 'Just now';
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Intl.DateTimeFormat('en-US', {
    timeZone: COLOMBO_TZ,
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(date);
}
