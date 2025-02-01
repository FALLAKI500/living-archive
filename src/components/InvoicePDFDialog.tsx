import { useState } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { InvoicePDF } from "./InvoicePDF"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InvoicePDFDialogProps {
  invoice: {
    id: string
    amount: number
    amount_paid: number
    due_date: string
    description: string
    properties: {
      name: string
    }
  }
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Generate PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to download the invoice as a PDF file.
          </p>
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`invoice-${invoice.id.slice(0, 8)}.pdf`}
          >
            {({ loading }) => {
              return (
                <Button className="w-full" disabled={loading}>
                  {loading ? "Preparing..." : "Download PDF"}
                </Button>
              )
            }}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}