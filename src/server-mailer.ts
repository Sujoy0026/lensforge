import nodemailer from 'nodemailer';

export interface SendVerificationEmailParams {
  email: string;
  verificationLink: string;
}

/**
 * Sends a premium verification email using SMTP if configured,
 * otherwise falls back to a descriptive console logger with the verification link.
 */
export async function sendVerificationEmail({ email, verificationLink }: SendVerificationEmailParams): Promise<{
  success: boolean;
  simulated: boolean;
  error?: string;
}> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  let sender = process.env.SMTP_SENDER;
  if (!sender) {
    if (host && host.includes('resend.com')) {
      sender = 'onboarding@resend.dev';
    } else {
      sender = 'noreply@lensforge.online';
    }
  }

  const isSmtpConfigured = !!(host && user && pass);

  const subject = 'Verify your LensForge Marketplace Account';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your LensForge Account</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #09090b;
          padding: 32px;
          text-align: center;
        }
        .logo {
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.05em;
          text-decoration: none;
        }
        .logo span {
          color: #6366f1;
        }
        .content {
          padding: 40px;
          line-height: 1.6;
        }
        h1 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 16px;
          color: #0f172a;
        }
        p {
          margin-top: 0;
          margin-bottom: 24px;
          color: #475569;
          font-size: 15px;
        }
        .btn-container {
          text-align: center;
          margin: 32px 0;
        }
        .btn {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff !important;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 28px;
          border-radius: 6px;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #4338ca;
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 24px 0;
        }
        .link-text {
          font-family: monospace;
          word-break: break-all;
          background-color: #f1f5f9;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 13px;
          color: #4f46e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="#" class="logo">Lens<span>Forge</span></a>
        </div>
        <div class="content">
          <h1>Confirm your email address</h1>
          <p>Thank you for signing up on the LensForge Marketplace! Before you can download high-quality digital assets or templates, we need to verify your email address.</p>
          
          <div class="btn-container">
            <a href="${verificationLink}" class="btn">Verify Email Address</a>
          </div>
          
          <p>If the button above doesn't work, copy and paste the link below into your web browser:</p>
          <div class="link-text">${verificationLink}</div>
          
          <div class="divider"></div>
          
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
            This email was sent to <strong>${email}</strong>. If you did not register for a LensForge account, please ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} LensForge Marketplace. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!isSmtpConfigured) {
    // Elegant fallback logger block
    console.log('\n' + '='.repeat(80));
    console.log('📬  [SIMULATED EMAIL SENDER] Verification Link Generated!');
    console.log(`To:      ${email}`);
    console.log(`From:    ${sender}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link:    ${verificationLink}`);
    console.log('='.repeat(80) + '\n');
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.SMTP_SENDER_NAME || 'LensForge Marketplace'}" <${sender}>`,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`[Mailer] Real verification email sent successfully to ${email}`);
    return { success: true, simulated: false };
  } catch (err: any) {
    console.error(`[Mailer] Real SMTP email sending failed to ${email}:`, err.message);
    return { success: false, simulated: false, error: err.message };
  }
}
