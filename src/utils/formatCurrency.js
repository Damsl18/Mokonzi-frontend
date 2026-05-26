/**
 * formatCurrency.js
 * Formate un nombre en francs congolais (CDF).
 * Ex: 15000 → "15.000 CDF"
 */
export const formatCDF = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '— CDF'
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default formatCDF
