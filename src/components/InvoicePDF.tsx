import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { format } from "date-fns"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#111",
  },
  invoiceId: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#111",
    borderBottom: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 120,
    color: "#666",
  },
  value: {
    flex: 1,
    color: "#111",
  },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
  totalLabel: {
    width: 120,
    fontWeight: "bold",
    color: "#111",
  },
  totalValue: {
    flex: 1,
    fontWeight: "bold",
    color: "#111",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#666",
    fontSize: 10,
    borderTop: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
  companyInfo: {
    marginBottom: 20,
    color: "#666",
  },
  companyName: {
    fontSize: 14,
    color: "#111",
    marginBottom: 4,
  },
})

interface InvoicePDFProps {
  invoice: {
    id: string
    amount: number
    amount_paid: number
    due_date: string
    description: string
    properties: {
      name: string
    }
    daily_rate: number
    days_rented: number
  }
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <Text style={styles.invoiceId}>#{invoice.id.slice(0, 8)}</Text>
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>Property Management Co.</Text>
          <Text>123 Business Avenue</Text>
          <Text>Business District, BZ 12345</Text>
          <Text>contact@propertymanagement.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{invoice.properties.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Daily Rate:</Text>
            <Text style={styles.value}>${invoice.daily_rate.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Days Rented:</Text>
            <Text style={styles.value}>{invoice.days_rented}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {format(new Date(invoice.due_date), "PPP")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{invoice.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>${invoice.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid:</Text>
            <Text style={styles.value}>${invoice.amount_paid.toLocaleString()}</Text>
          </View>
          <View style={[styles.row, styles.total]}>
            <Text style={styles.totalLabel}>Balance Due:</Text>
            <Text style={styles.totalValue}>
              ${(invoice.amount - invoice.amount_paid).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your business. Please make payment by the due date.
        </Text>
      </Page>
    </Document>
  )
}