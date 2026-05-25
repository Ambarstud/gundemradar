export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000 / 60);
  if (diff < 1) return 'az önce';
  if (diff < 60) return `${diff}dk önce`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

export function isBorsaOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= 600 && totalMinutes < 1080; // 10:00 - 18:00 Turkey time
}

export function direction(change: number): 'up' | 'down' | 'flat' {
  if (change > 0.01) return 'up';
  if (change < -0.01) return 'down';
  return 'flat';
}
