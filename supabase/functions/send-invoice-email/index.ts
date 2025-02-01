import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  customerName: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, invoiceId, amount, dueDate, email }: InvoiceEmailRequest = await req.json();

    console.log("Sending overdue invoice email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Rental Manager <onboarding@resend.dev>",
      to: [email],
      subject: "Payment Reminder – Invoice Overdue",
      html: `
        <h2>Payment Reminder</h2>
        <p>Hello ${customerName},</p>
        <p>This is a reminder that your invoice #${invoiceId.substring(0, 8)} is overdue.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Amount Due:</strong> $${amount.toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        <p>Please make a payment as soon as possible.</p>
        <p>Thank you,<br>Rental Manager</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);