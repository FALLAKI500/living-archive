import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { format } from "date-fns"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 120,
  },
  value: {
    flex: 1,
  },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 10,
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
  }
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <Text>#{invoice.id.slice(0, 8)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Property Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{invoice.properties.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Invoice Details</Text>
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
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Payment Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>${invoice.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid:</Text>
            <Text style={styles.value}>${invoice.amount_paid.toLocaleString()}</Text>
          </View>
          <View style={[styles.row, styles.total]}>
            <Text style={styles.label}>Balance Due:</Text>
            <Text style={styles.value}>
              ${(invoice.amount - invoice.amount_paid).toLocaleString()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}