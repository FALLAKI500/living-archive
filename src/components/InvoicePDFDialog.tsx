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
          >
            {(props: { loading: boolean }) => (
              <Button disabled={props.loading}>
                {props.loading ? "Generating PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}