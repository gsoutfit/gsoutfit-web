import nodemailer from "nodemailer";
import { getDb, addMailLog } from "./db";
import { MailLog } from "@/types";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  previewText?: string;
  otpCode?: string;
  type?: "verification" | "order" | "notification" | "test";
}

/**
 * Creates an active SMTP transporter if environment variables or database settings are configured.
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Check database settings
  try {
    const db = await getDb();
    if (db.settings?.smtp?.enabled && db.settings.smtp.host && db.settings.smtp.user && db.settings.smtp.pass) {
      return nodemailer.createTransport({
        host: db.settings.smtp.host,
        port: db.settings.smtp.port || 587,
        secure: db.settings.smtp.secure || false,
        auth: {
          user: db.settings.smtp.user,
          pass: db.settings.smtp.pass,
        },
      });
    }
  } catch (err) {
    console.error("Error reading database SMTP settings:", err);
  }

  return null;
}

/**
 * Universal email dispatch method supporting live SMTP and free zero-config local dev preview logging.
 */
export async function sendEmail({
  to,
  subject,
  html,
  previewText = "",
  otpCode,
  type = "notification",
}: SendMailOptions): Promise<{ success: boolean; mode: "smtp" | "dev_preview"; message: string; log: MailLog }> {
  const fromAddress =
    process.env.SMTP_FROM || "Gentlemen Savage Concierge <concierge@gentlemensavage.com>";

  const transporter = await getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text: previewText,
      });

      const log = await addMailLog({
        to,
        subject,
        previewText: previewText || subject,
        html,
        otpCode,
        status: "Sent (SMTP)",
        type,
      });

      return {
        success: true,
        mode: "smtp",
        message: `Email dispatched via SMTP to ${to}`,
        log,
      };
    } catch (error: any) {
      console.warn("SMTP send failed, falling back to Dev Preview Mail Logger:", error.message);
      const log = await addMailLog({
        to,
        subject,
        previewText: previewText || subject,
        html,
        otpCode,
        status: "Failed",
        type,
        error: error.message,
      });
      return {
        success: false,
        mode: "smtp",
        message: `SMTP delivery failed: ${error.message}`,
        log,
      };
    }
  }

  // Free Dev / Zero-Config Mode: Store to mail logs & log to server console
  console.log("--------------------------------------------------");
  console.log(`[FREE MAIL ENGINE DISPATCH - DEV PREVIEW]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  if (otpCode) {
    console.log(`🔑 OTP / VERIFICATION CODE: ${otpCode}`);
  }
  console.log("--------------------------------------------------");

  const log = await addMailLog({
    to,
    subject,
    previewText: previewText || (otpCode ? `Verification Code: ${otpCode}` : subject),
    html,
    otpCode,
    status: "Sent (Dev Preview)",
    type,
  });

  return {
    success: true,
    mode: "dev_preview",
    message: `Email recorded in Mail Center (Dev Preview Mode). OTP Code: ${otpCode || "N/A"}`,
    log,
  };
}

/**
 * Luxury HTML Email Template for Admin Registration Verification
 */
export function getAdminVerificationEmailTemplate(name: string, username: string, code: string): { html: string; text: string } {
  const text = `Gentlemen Savage — Admin Security Verification. Your 6-digit activation code is: ${code}. Valid for 15 minutes.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Security Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0b0c;padding:40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#141418;border:1px solid #2a2a33;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header Banner -->
          <tr>
            <td style="padding:36px 36px 24px;text-align:center;border-bottom:1px solid #22222a;background:linear-gradient(180deg, #18181f 0%, #141418 100%);">
              <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:900;letter-spacing:0.25em;color:#ffffff;text-transform:uppercase;">
                GENTLEMAN
              </div>
              <div style="font-size:10px;font-weight:800;letter-spacing:0.5em;color:#D4AF37;text-transform:uppercase;margin-top:2px;">
                SAVAGE
              </div>
              <div style="display:inline-block;margin-top:14px;padding:4px 14px;background-color:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.4);border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.15em;color:#D4AF37;text-transform:uppercase;">
                Security Verification Dossier
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                Administrator Access Request
              </h2>
              <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#a1a1aa;">
                Greetings <strong style="color:#ffffff;">${name}</strong> (Username: <span style="color:#D4AF37;font-weight:bold;">${username}</span>),
              </p>
              <p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:#a1a1aa;">
                A request has been initiated to register or verify your master administrator account for the <strong>Gentlemen Savage</strong> business console. Please submit the 6-digit authentication code below:
              </p>

              <!-- OTP Code Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center" style="background-color:#0b0b0c;border:2px solid #D4AF37;border-radius:18px;padding:22px 10px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;color:#a1a1aa;text-transform:uppercase;margin-bottom:8px;">
                      Your Single-Use Verification Pin
                    </div>
                    <div style="font-family:'SF Pro Display',Menlo,monospace;font-size:36px;font-weight:900;letter-spacing:0.35em;color:#D4AF37;text-indent:0.35em;">
                      ${code}
                    </div>
                    <div style="font-size:11px;color:#71717a;margin-top:8px;">
                      ⏱ Expires in <strong>15 minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:#71717a;">
                If you did not request this security code, please disregard this email. Unauthorized login attempts are automatically rate-limited and logged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;background-color:#0d0d10;border-top:1px solid #202026;text-align:center;">
              <p style="margin:0;font-size:11px;color:#52525b;">
                © ${new Date().getFullYear()} Gentlemen Savage Inc. Executive Security Infrastructure.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { html, text };
}

/**
 * Luxury Test Email Template
 */
export function getTestEmailTemplate(recipient: string): { html: string; text: string } {
  const text = `Gentlemen Savage Mail Engine: SMTP connectivity test successful to ${recipient}.`;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#0b0b0c;font-family:sans-serif;color:#f4f4f5;">
  <div style="max-width:500px;margin:30px auto;background:#141418;border:1px solid #D4AF37;border-radius:20px;padding:30px;text-align:center;">
    <h3 style="color:#D4AF37;font-size:18px;margin-top:0;">Gentlemen Savage Mail Engine</h3>
    <p style="font-size:13px;color:#d4d4d8;">Test message successfully dispatched to <strong>${recipient}</strong>.</p>
    <p style="font-size:11px;color:#71717a;">Dispatched on: ${new Date().toUTCString()}</p>
  </div>
</body>
</html>
  `.trim();

  return { html, text };
}
