import api from './axiosConfig'
export const getWeeklyReport = async () => { const r = await api.get('/reports/weekly/'); return r.data }
export const getDailyReport = async () => { const r = await api.get('/reports/daily/'); return r.data }
export const getAverageSales = async () => { const r = await api.get('/reports/average-sales/'); return r.data }
