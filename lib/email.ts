import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY is missing. Email will not be sent.");
    
    // IN DEVELOPMENT: Log the email content so the user can see the link in the terminal
    if (process.env.NODE_ENV !== "production") {
      console.log("\n" + "=".repeat(50));
      console.log("🛠️  DEVELOPMENT EMAIL LOG");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log("-".repeat(50));
      console.log("CONTENT:");
      // Look for links in the HTML
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`\x1b[36mLINK: ${linkMatch[1]}\x1b[0m`);
      }
      console.log("-".repeat(50));
      console.log("=".repeat(50) + "\n");
      
      // Return a mock result so the caller thinks it succeeded
      return { id: "dev-mock-id" };
    }
    
    // IN PRODUCTION: Still throw error
    throw new Error("Sistem email belum dikonfigurasi (RESEND_API_KEY hilang)");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@useyapi.com",
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
