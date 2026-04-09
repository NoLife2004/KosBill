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
    console.error("❌ ERROR: RESEND_API_KEY is missing!");
    
    if (process.env.NODE_ENV !== "production") {
      console.log("\n" + "=".repeat(50));
      console.log("🛠️  DEVELOPMENT EMAIL LOG");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log("-".repeat(50));
      // Look for links in the HTML
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`LINK: ${linkMatch[1]}`);
      }
      console.log("=".repeat(50) + "\n");
      return { id: "dev-mock-id" };
    }
    throw new Error("Email system not configured (API Key missing)");
  }

  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || "",
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(`Resend Error: ${error.message}`);
    }

    console.log(`✅ Email sent successfully to ${to}. ID: ${data?.id}`);
    return data;
  } catch (err) {
    console.error("❌ Failed to send email via Resend:", err);
    throw err;
  }
}