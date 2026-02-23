/**
 * Kair0s Utility Function for Class Names
 * 
 * Utility function for combining Tailwind CSS classes
 * with proper type safety and conditional logic.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
