import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const exportRevenueToExcel = async () => {
  // Fetch revenue data
  const { data: monthlyRevenue } = await supabase
    .from('monthly_revenue_summary')
    .select('*')
    .order('month', { ascending: false });

  const { data: propertyRevenue } = await supabase
    .from('property_revenue_summary')
    .select('*')
    .order('total_billed', { ascending: false });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Monthly Revenue Sheet
  const monthlyData = monthlyRevenue?.map(row => ({
    'Month': format(new Date(row.month), 'MMMM yyyy'),
    'Total Revenue': `$${row.total_revenue?.toLocaleString()}`,
    'Number of Invoices': row.invoice_count,
    'Number of Payments': row.payment_count
  })) || [];

  const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);

  // Property Revenue Sheet
  const propertyData = propertyRevenue?.map(row => ({
    'Property': row.property_name,
    'Total Billed': `$${row.total_billed?.toLocaleString()}`,
    'Total Paid': `$${row.total_paid?.toLocaleString()}`,
    'Outstanding Balance': `$${row.outstanding_balance?.toLocaleString()}`,
    'Number of Invoices': row.invoice_count
  })) || [];

  const propertySheet = XLSX.utils.json_to_sheet(propertyData);

  // Set column widths
  const monthlyColWidths = [
    { wch: 15 }, // Month
    { wch: 15 }, // Total Revenue
    { wch: 15 }, // Number of Invoices
    { wch: 15 }, // Number of Payments
  ];

  const propertyColWidths = [
    { wch: 30 }, // Property
    { wch: 15 }, // Total Billed
    { wch: 15 }, // Total Paid
    { wch: 15 }, // Outstanding Balance
    { wch: 15 }, // Number of Invoices
  ];

  monthlySheet['!cols'] = monthlyColWidths;
  propertySheet['!cols'] = propertyColWidths;

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Revenue');
  XLSX.utils.book_append_sheet(workbook, propertySheet, 'Property Revenue');

  // Generate and download file
  XLSX.writeFile(workbook, 'revenue-report.xlsx');
};