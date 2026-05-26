/**
 * reportsAPI.js — corrigé selon les vues réelles
 * weekly       : GET /api/reports/weekly/
 *   Retourne   : { week_start, week_end, total_sales, total_quantity, average_daily_sales, daily_breakdown[] }
 * daily        : GET /api/reports/daily/ (DailyReportViewSet list)
 *   Retourne   : [{ id, report_date, total_sales_count, total_sales_amount, total_quantity_sold, average_sale_price }]
 * average-sales: GET /api/reports/average-sales/
 *   Retourne   : { period, total_sales, total_sales_count, average_sale_price, average_sales_per_day }
 */
import api from './axiosConfig'

export const getWeeklyReport = async () => {
  const r = await api.get('/reports/weekly/')
  return r.data
}

export const getDailyReport = async () => {
  const r = await api.get('/reports/daily/')
  return r.data
}

export const getAverageSales = async () => {
  const r = await api.get('/reports/average-sales/')
  return r.data
}
