import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface InvoiceData {
  id: string;
  properties: {
    name: string;
  };
  amount: number;
  amount_paid: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
}

export const exportInvoicesToExcel = (invoices: InvoiceData[]) => {
  const workbook = XLSX.utils.book_new();
  
  const data = invoices.map(invoice => ({
    'Invoice ID': invoice.id.slice(0, 8),
    'Property Name': invoice.properties.name,
    'Due Date': format(new Date(invoice.due_date), 'PP'),
    'Amount Due': `$${invoice.amount.toLocaleString()}`,
    'Amount Paid': `$${invoice.amount_paid.toLocaleString()}`,
    'Remaining': `$${(invoice.amount - invoice.amount_paid).toLocaleString()}`,
    'Status': invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Invoice ID
    { wch: 30 }, // Property Name
    { wch: 15 }, // Due Date
    { wch: 15 }, // Amount Due
    { wch: 15 }, // Amount Paid
    { wch: 15 }, // Remaining
    { wch: 10 }, // Status
  ];
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
  XLSX.writeFile(workbook, 'invoices.xlsx');
};