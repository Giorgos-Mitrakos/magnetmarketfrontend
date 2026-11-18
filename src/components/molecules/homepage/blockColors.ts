// Χρώματα φόντου για τα blocks της αρχικής (ίδια παλέτα με τις λίστες προϊόντων).
// Πλήρη ονόματα κλάσεων, ώστε να τα «βλέπει» το Tailwind.
import { TBlockColor } from '@/lib/queries/homepage'

export const BLOCK_BG: Record<TBlockColor, string> = {
  purple: 'bg-gradient-to-br from-[#6e276f] to-[#a9488e] dark:from-[#3d183e] dark:to-[#5a205b]',
  magenta: 'bg-gradient-to-br from-[#a9488e] to-[#d0559f] dark:from-[#5a2349] dark:to-[#8c3a75]',
  blue: 'bg-gradient-to-br from-[#24488f] to-[#246eb5] dark:from-[#153a61] dark:to-[#1e5a95]',
  orange: 'bg-gradient-to-br from-[#ea580c] to-[#f59e0b] dark:from-[#9a3412] dark:to-[#ea580c]',
  red: 'bg-gradient-to-br from-[#b91c1c] to-[#ef4444] dark:from-[#991b1b] dark:to-[#b91c1c]',
  navy: 'bg-gradient-to-br from-[#132247] to-[#24488f] dark:from-[#0d1730] dark:to-[#1d3a72]',
  black: 'bg-gradient-to-br from-slate-950 to-slate-800',
}

export const blockBg = (color?: string | null) => BLOCK_BG[(color as TBlockColor) || 'purple'] ?? BLOCK_BG.purple

export const eur = (n?: number | null) =>
  n == null ? '' : new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n)
