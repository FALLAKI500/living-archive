import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { useState } from "react";

interface InvoicePDFDialogProps {
  invoice: {
    id: string;
    amount: number;
    due_date: string;
    description?: string;
    property: {
      name: string;
      location: string;
    };
    tenant: {
      full_name: string;
    };
  };
}

export function InvoicePDFDialog({ invoice }: InvoicePDFDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Download PDF</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Invoice PDF</DialogTitle>
          <DialogDescription>
            Click the button below to download the invoice as a PDF file.
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
  );
}