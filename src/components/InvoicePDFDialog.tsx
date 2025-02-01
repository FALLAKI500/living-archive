import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileDown } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { InvoicePDF } from "./InvoicePDF"

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

interface InvoicePDFDialogProps {
  invoice: Invoice
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <FileDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Invoice PDF</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`invoice-${invoice.id}.pdf`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {({ loading }) => (
              loading ? "Generating PDF..." : "Download PDF"
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}