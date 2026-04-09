import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get("to") || "santosperdana@gmail.com";
  
  try {
    console.log(`[Test Email] Initiating test to ${to}`);
    const data = await sendEmail({
      to,
      subject: "Test Email from KosBill Reminder",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1 style="color: #2563eb;">Testing Email Configuration</h1>
          <p>If you see this, email configuration is working!</p>
          <p><strong>To:</strong> ${to}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_FROM || "Not set"}</p>
          <p><strong>API Key set:</strong> ${!!process.env.RESEND_API_KEY}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Generated at: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    
    return NextResponse.json({
      success: true,
      data,
      env: {
        from: process.env.EMAIL_FROM,
        apiKeySet: !!process.env.RESEND_API_KEY,
      }
    });
  } catch (error: any) {
    console.error("[Test Email] Error occurred during testing:", error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      env: {
        from: process.env.EMAIL_FROM,
        apiKeySet: !!process.env.RESEND_API_KEY,
      }
    }, { status: 500 });
  }
}
