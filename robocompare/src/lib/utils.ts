import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateShareId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatPrice(price: number, unit: string = 'CNY'): string {
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: unit,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(price)
}

export function formatDate(date: Date | string, locale: string = 'zh-CN'): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function compareValues(
  a: number | null | undefined,
  b: number | null | undefined,
  rule: 'higher_better' | 'lower_better' | 'none'
): number {
  if (a === null || a === undefined) return -1
  if (b === null || b === undefined) return 1
  if (rule === 'higher_better') return b - a
  if (rule === 'lower_better') return a - b
  return 0
}

export function getBestValue(
  values: (number | null | undefined)[],
  rule: 'higher_better' | 'lower_better' | 'none'
): number | null {
  const validValues = values.filter((v): v is number => v !== null && v !== undefined)
  if (validValues.length === 0) return null
  if (rule === 'none') return null
  if (rule === 'higher_better') return Math.max(...validValues)
  return Math.min(...validValues)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
