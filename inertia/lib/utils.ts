import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWatchedTime(minutes: number) {
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  const formatValue = (value: number) => value.toString().padStart(2, '0')

  const parts: string[] = []
  if (days > 0) parts.push(`${formatValue(days)}d`)
  if (hours > 0) parts.push(`${formatValue(hours)}h`)
  if (mins > 0 || parts.length === 0) parts.push(`${formatValue(mins)}m`)
  return parts.join(' ')
}
