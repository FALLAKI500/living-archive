import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { InvoicePDF } from "@/components/InvoicePDF"
import type { Invoice } from "@/types/invoice"

interface InvoicePDFDialogProps {
  invoice: Invoice
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  // Ensure description is never undefined for InvoicePDF
  const invoiceWithDefaults = {
    ...invoice,
    description: invoice.description || 'No description provided'
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoiceWithDefaults} />}
          fileName={`invoice-${invoice.id}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading}>
              {loading ? "Generating PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </DialogContent>
    </Dialog>
  )
}