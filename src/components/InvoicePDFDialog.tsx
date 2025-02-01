import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import { Invoice } from "@/types/invoice";

interface InvoicePDFDialogProps {
  invoice: Invoice;
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF invoice={invoice} />}
      fileName={`invoice-${invoice.id}.pdf`}
    >
      {({ loading }) => (
        <Button variant="ghost" size="icon" disabled={loading}>
          <FileDown className="h-4 w-4" />
        </Button>
      )}
    </PDFDownloadLink>
  );
}