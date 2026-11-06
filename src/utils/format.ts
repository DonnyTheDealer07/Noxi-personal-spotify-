export function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
export function firstImage(images?: { url: string }[]): string | undefined { return images?.[0]?.url; }
export function artistsText(artists?: { name: string }[]): string { return artists?.map((artist) => artist.name).join(', ') || 'Unknown artist'; }
