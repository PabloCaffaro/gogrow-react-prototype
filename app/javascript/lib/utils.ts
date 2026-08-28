import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases opcionales (`clsx`) y resuelve conflictos entre utilidades de
 * Tailwind (`twMerge`). Aunque los componentes ahora usan CSS Modules, esta
 * función sigue permitiendo que quien los consume agregue un `className` propio.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
