import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with symbol based on currency code (deprecated - use the one from currency.ts)
// This is kept for backward compatibility
export function formatCurrency(amount: number | string, currency: string = 'TRY') {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    TRY: '₺',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Use Turkish locale for consistent formatting
  return `${symbol}${numAmount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format date from ISO string or Date object to readable format
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Calculate days until a given date
export function daysUntil(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Get initials from name
export function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
