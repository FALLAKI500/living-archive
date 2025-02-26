import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileSpreadsheet, FileDown } from "lucide-react"
import { exportInvoicesToExcel } from "@/utils/excelExport"
import { exportRevenueToExcel } from "@/utils/revenueExport"
import { toast } from "sonner"

interface Invoice {
  id: string
  amount: number
  amount_paid: number
  due_date: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  description: string | null
  properties: {
    name: string
  }
  daily_rate: number
  days_rented: number
}

interface ExportDialogProps {
  invoices: Invoice[]
}

export function ExportDialog({ invoices }: ExportDialogProps) {
  const handleExportToExcel = () => {
    try {
      exportInvoicesToExcel(invoices)
      toast.success("Invoices exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export invoices")
    }
  }

  const handleExportRevenueToExcel = async () => {
    try {
      await exportRevenueToExcel()
      toast.success("Revenue data exported successfully")
    } catch (error) {
      console.error("Revenue export error:", error)
      toast.error("Failed to export revenue data")
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
          <DialogTitle>Export Reports</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="gap-2 justify-start"
            onClick={handleExportToExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Invoices to Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2 justify-start"
            onClick={handleExportRevenueToExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Revenue Report to Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2 justify-start"
            disabled
            title="Coming soon"
          >
            <FileDown className="h-4 w-4" />
            Export All as PDF (Coming Soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}