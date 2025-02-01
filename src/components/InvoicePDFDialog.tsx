import { useState } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download } from "lucide-react"
import { InvoicePDF } from "./InvoicePDF"

interface Invoice {
  id: string
  amount: number
  due_date: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  description: string
  properties: {
    name: string
  }
  daily_rate: number
  days_rented: number
  amount_paid: number
  start_date: string | null
  end_date: string | null
}

interface InvoicePDFDialogProps {
  invoice: Invoice
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
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
          >
            {({ loading }: { loading: boolean }) => (
              <Button disabled={loading}>
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}