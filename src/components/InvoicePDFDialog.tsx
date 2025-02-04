import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer"
import { InvoicePDF } from "./InvoicePDF"
import { Invoice } from "@/types/invoice"
import { ReactElement } from "react"

interface InvoicePDFDialogProps {
  invoice: Invoice
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  const invoiceWithDefaults = {
    ...invoice,
    description: invoice.description || 'No description provided',
    properties: invoice.properties || { name: 'Unknown Property' }
  }

  return (
    <BlobProvider document={<InvoicePDF invoice={invoiceWithDefaults} />}>
      {({ blob, url, loading }): ReactElement => (
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoiceWithDefaults} />}
          fileName={`invoice-${invoice.id}.pdf`}
        >
          <Button variant="ghost" size="icon" disabled={loading}>
            <FileDown className="h-4 w-4" />
          </Button>
        </PDFDownloadLink>
      )}
    </BlobProvider>
  )
}