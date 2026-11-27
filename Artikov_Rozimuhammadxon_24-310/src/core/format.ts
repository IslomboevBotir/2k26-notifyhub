/** Sana va vaqtni loyiha bo'ylab bir xil formatda chiqarish. */

const pad = (n: number): string => String(n).padStart(2, "0");

/** 07.11.2026 15:30 (seconds=true bo'lsa: 07.11.2026 15:30:05) */
export function formatDateTime(date: Date, seconds = false): string {
  const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return seconds ? `${day} ${time}:${pad(date.getSeconds())}` : `${day} ${time}`;
}
