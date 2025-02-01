import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Invoice } from "@/types/invoice"
import { InvoicePDF } from "./InvoicePDF"

interface InvoicePDFDialogProps {
  invoice: Invoice
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Download PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`invoice-${invoice.id}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>
                {loading ? "Generating PDF..." : "Download Now"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}