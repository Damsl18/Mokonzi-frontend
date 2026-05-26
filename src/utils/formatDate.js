/**
 * formatDate.js
 * Utilitaires de formatage de dates en français.
 */
import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Formate une date ISO en "23 mai 2025"
 */
export const formatDateLong = (dateStr) => {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  if (!isValid(date)) return '—'
  return format(date, 'd MMMM yyyy', { locale: fr })
}

/**
 * Formate une date ISO en "23/05/2025"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  if (!isValid(date)) return '—'
  return format(date, 'dd/MM/yyyy')
}

/**
 * Formate une date ISO en "23/05/2025 à 14:30"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  if (!isValid(date)) return '—'
  return format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr })
}
