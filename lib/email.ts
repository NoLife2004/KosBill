import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("⚠️ [Email] RESEND_API_KEY is missing. Printing to console instead.");
    
    if (process.env.NODE_ENV !== "production") {
      console.log("\n" + "=".repeat(50));
      console.log("🛠️  DEVELOPMENT EMAIL LOG");
      console.log(`To: ${to}`);
      console.log(`From: ${fromAddress}`);
      console.log(`Subject: ${subject}`);
      console.log("-".repeat(50));
      const linkMatch = html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`\x1b[36mLINK: ${linkMatch[1]}\x1b[0m`);
      }
      console.log("-".repeat(50));
      console.log("=".repeat(50) + "\n");
      return { id: "dev-mock-id" };
    }
    throw new Error("Sistem email belum dikonfigurasi (RESEND_API_KEY hilang)");
  }

  const resend = new Resend(apiKey);
  console.log(`[Email] Attempting to send: to=${to}, from=${fromAddress}, subject="${subject}"`);

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to], // Some versions prefer array
      subject,
      html,
      text: text || "",
    });

    if (error) {
      console.error("❌ [Email Error Detail]:", {
        name: error.name,
        message: error.message,
        // @ts-ignore
        statusCode: error.statusCode,
      });
      throw new Error(`Resend Error: ${error.message}`);
    }

    console.log(`✅ [Email Success]: Sent to ${to}. ID: ${data?.id}`);
    return data;
  } catch (err: any) {
    console.error("❌ [Email Exception]:", err?.message || err);
    throw err;
  }
}
