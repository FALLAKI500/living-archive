import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileSpreadsheet, FileDown } from "lucide-react"
import { exportCustomersToExcel } from "@/utils/customerExport"
import { toast } from "sonner"

interface CustomerExportDialogProps {
  customers: {
    id: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    company_name: string | null;
    total_bookings: number;
    total_spent: number;
    last_booking_date: string | null;
  }[]
}

export function ExportDialog({ customers }: CustomerExportDialogProps) {
  const handleExportToExcel = () => {
    try {
      exportCustomersToExcel(customers)
      toast.success("Customer data exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export customer data")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Customer Data</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="gap-2 justify-start"
            onClick={handleExportToExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2 justify-start"
            disabled
            title="Coming soon"
          >
            <FileDown className="h-4 w-4" />
            Export as PDF (Coming Soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}