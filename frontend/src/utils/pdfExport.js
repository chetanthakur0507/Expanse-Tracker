import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportToPDF = (transactions, summary, userName) => {
  const doc = new jsPDF()
  const date = new Date().toLocaleDateString('en-IN')

  // Header
  doc.setFillColor(16, 185, 129)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Finance Tracker Report', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated for: ${userName}  |  Date: ${date}`, 14, 28)

  // Summary boxes
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)

  const boxY = 45
  const summaryData = [
    { label: 'Total Income', value: `Rs. ${summary.income?.toLocaleString('en-IN') || 0}`, color: [209, 250, 229] },
    { label: 'Total Expense', value: `Rs. ${summary.expense?.toLocaleString('en-IN') || 0}`, color: [254, 226, 226] },
    { label: 'Net Balance', value: `Rs. ${summary.balance?.toLocaleString('en-IN') || 0}`, color: [219, 234, 254] },
  ]

  summaryData.forEach((item, i) => {
    const x = 14 + i * 62
    doc.setFillColor(...item.color)
    doc.roundedRect(x, boxY, 58, 24, 3, 3, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(item.label, x + 5, boxY + 9)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(item.value, x + 5, boxY + 19)
    doc.setFont('helvetica', 'normal')
  })

  // Transactions Table
  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text('Transaction History', 14, 82)

  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString('en-IN'),
    t.description,
    t.category,
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    `Rs. ${t.amount.toLocaleString('en-IN')}`,
  ])

  autoTable(doc, {
    startY: 86,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: tableData,
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      4: { halign: 'right' },
      3: { cellWidth: 24 },
    },
    styles: { fontSize: 9, cellPadding: 4 },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        if (data.cell.text[0] === 'Income') data.cell.styles.textColor = [5, 150, 105]
        else data.cell.styles.textColor = [220, 38, 38]
      }
    },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Finance Tracker  |  Page ${i} of ${pageCount}`, 14, 290)
  }

  doc.save(`finance-report-${date.replace(/\//g, '-')}.pdf`)
}
