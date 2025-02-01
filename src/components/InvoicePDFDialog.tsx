import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
        <Button variant="outline">Download PDF</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Invoice PDF</DialogTitle>
          <DialogDescription>
            Click the button below to download your invoice as a PDF file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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