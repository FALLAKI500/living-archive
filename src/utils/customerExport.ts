import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface CustomerData {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  company_name: string | null;
  total_bookings: number;
  total_spent: number;
  last_booking_date: string | null;
}

export const exportCustomersToExcel = (customers: CustomerData[]) => {
  const workbook = XLSX.utils.book_new();
  
  const data = customers.map(customer => ({
    'Name': customer.full_name || 'N/A',
    'Company': customer.company_name || 'N/A',
    'Phone': customer.phone || 'N/A',
    'City': customer.city || 'N/A',
    'Total Bookings': customer.total_bookings,
    'Total Spent': `${customer.total_spent.toLocaleString()} MAD`,
    'Last Booking': customer.last_booking_date 
      ? format(new Date(customer.last_booking_date), 'PP')
      : 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 30 }, // Name
    { wch: 30 }, // Company
    { wch: 15 }, // Phone
    { wch: 20 }, // City
    { wch: 15 }, // Total Bookings
    { wch: 15 }, // Total Spent
    { wch: 15 }, // Last Booking
  ];
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  XLSX.writeFile(workbook, 'customers.xlsx');
};