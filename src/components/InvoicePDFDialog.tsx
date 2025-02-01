import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Invoice } from "@/types/invoice"
import { InvoicePDF } from "./InvoicePDF"

interface InvoicePDFDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePDFDialog({ invoice, open, onOpenChange }: InvoicePDFDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Invoice PDF</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`invoice-${invoice.id}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>
                {loading ? "Generating PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}