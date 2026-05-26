/**
 * pdfExport.js — corrigé selon WeeklyReportSerializer
 * Champs : week_start, week_end, total_sales, total_quantity, average_daily_sales, daily_breakdown[]
 * daily_breakdown[] : { report_date, total_sales_count, total_sales_amount, total_quantity_sold }
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDateShort } from './formatDate'
import { formatCDF } from './formatCurrency'

export const exportWeeklyReportPDF = (report) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // En-tête
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20); doc.setFont('helvetica', 'bold')
  doc.text('ETS MOKONZI', 14, 16)
  doc.setFontSize(11); doc.setFont('helvetica', 'normal')
  doc.text('Rapport Hebdomadaire des Ventes', 14, 26)
  doc.text(`Généré le ${formatDateShort(new Date().toISOString())}`, 14, 34)

  // Période
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(12); doc.setFont('helvetica', 'bold')
  doc.text('Période', 14, 52)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text(`Du ${formatDateShort(report.week_start)} au ${formatDateShort(report.week_end)}`, 14, 60)

  // Résumé
  autoTable(doc, {
    startY: 66,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Chiffre d\'affaires (semaine)', formatCDF(report.total_sales ?? 0)],
      ['Quantité totale vendue', String(report.total_quantity ?? 0)],
      ['Moyenne journalière', formatCDF(report.average_daily_sales ?? 0)],
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  })

  // Détail journalier
  if (report.daily_breakdown && report.daily_breakdown.length > 0) {
    const lastY = doc.lastAutoTable.finalY + 12
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59)
    doc.text('Détail par jour', 14, lastY)
    autoTable(doc, {
      startY: lastY + 6,
      head: [['Date', 'Nb ventes', 'CA', 'Quantité']],
      body: report.daily_breakdown.map(d => [
        formatDateShort(d.report_date),
        String(d.total_sales_count),
        formatCDF(d.total_sales_amount),
        String(d.total_quantity_sold),
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
    })
  }

  // Pied de page
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8); doc.setTextColor(100)
    doc.text(`ETS Mokonzi — Page ${i}/${pageCount}`, doc.internal.pageSize.getWidth() / 2, 290, { align: 'center' })
  }

  doc.save(`rapport-hebdo-${formatDateShort(new Date().toISOString())}.pdf`)
}
