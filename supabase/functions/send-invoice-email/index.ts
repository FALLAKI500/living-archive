import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
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
    const { customerName, invoiceId, amount, dueDate, email }: EmailRequest = await req.json();

    console.log(`Sending overdue invoice email to ${email} for invoice ${invoiceId}`);

    const emailResponse = await resend.emails.send({
      from: "Invoicing System <onboarding@resend.dev>",
      to: [email],
      subject: "Important: Invoice Payment Overdue",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e11d48;">Overdue Invoice Notice</h2>
          <p>Dear ${customerName},</p>
          <p>This is a reminder that the payment for invoice <strong>#${invoiceId}</strong> is now overdue.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Invoice Details:</strong></p>
            <p style="margin: 8px 0;">Amount Due: $${amount.toLocaleString()}</p>
            <p style="margin: 8px 0;">Due Date: ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          <p>Please process this payment as soon as possible to avoid any additional fees or service interruptions.</p>
          <p>If you have already made this payment, please disregard this notice and accept our thanks.</p>
          <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          <p style="margin-top: 30px;">Best regards,<br>Your Property Management Team</p>
        </div>
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
  } catch (error) {
    console.error("Error sending email:", error);
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