import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_NAME = 'GoldMine Pro';
const FROM_EMAIL = process.env.SMTP_USER || 'noreply@goldminepro.com';

function emailTemplate(content, subject) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:24px 0;">
    <span style="font-size:24px;font-weight:bold;background:linear-gradient(90deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
      ⛏️ ${APP_NAME}
    </span>
  </div>
  <div style="background:#1a1a2e;border-radius:16px;padding:32px 24px;border:1px solid #2a2a4a;">
    <h2 style="color:#ffffff;margin:0 0 16px;font-size:20px;">${subject}</h2>
    ${content}
  </div>
  <div style="text-align:center;padding:20px 0;">
    <p style="color:#555;font-size:11px;margin:0;">
      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
    </p>
  </div>
</div>
</body>
</html>`;
}

export async function sendOTPEmail(to, otp, name) {
  const content = `
    <p style="color:#aaa;font-size:14px;line-height:1.6;">Hi ${name || 'there'},</p>
    <p style="color:#aaa;font-size:14px;line-height:1.6;">Your verification code is:</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="background:#FFD700;color:#0f0f1a;font-size:28px;font-weight:bold;letter-spacing:8px;padding:12px 24px;border-radius:12px;font-family:monospace;">
        ${otp}
      </span>
    </div>
    <p style="color:#666;font-size:12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
  `;

  return sendEmail(to, `Your verification code: ${otp}`, emailTemplate(content, 'Verify Your Account'));
}

export async function sendWelcomeEmail(to, name) {
  const content = `
    <p style="color:#aaa;font-size:14px;line-height:1.6;">Welcome ${name}! 🎉</p>
    <p style="color:#aaa;font-size:14px;line-height:1.6;">
      Your ${APP_NAME} account has been created. Start your gold mining journey by subscribing to a plan.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/plans" style="background:linear-gradient(135deg,#FFD700,#FFA500);color:#0f0f1a;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;">
        Choose a Plan
      </a>
    </div>
  `;

  return sendEmail(to, `Welcome to ${APP_NAME}!`, emailTemplate(content, 'Welcome to GoldMine Pro'));
}

export async function sendWithdrawalEmail(to, name, amount, status) {
  const statusColors = { approved: '#10B981', rejected: '#EF4444', completed: '#3B82F6' };
  const content = `
    <p style="color:#aaa;font-size:14px;">Hi ${name},</p>
    <p style="color:#aaa;font-size:14px;">
      Your withdrawal request of <strong style="color:#FFD700;">₹${amount.toLocaleString('en-IN')}</strong>
      has been <strong style="color:${statusColors[status] || '#aaa'};">${status}</strong>.
    </p>
  `;

  return sendEmail(to, `Withdrawal ${status} - ₹${amount.toLocaleString('en-IN')}`, emailTemplate(content, 'Withdrawal Update'));
}

export async function sendPasswordResetEmail(to, resetUrl, name) {
  const content = `
    <p style="color:#aaa;font-size:14px;">Hi ${name || 'there'},</p>
    <p style="color:#aaa;font-size:14px;">You requested to reset your password. Click the button below to proceed:</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="background:linear-gradient(135deg,#FFD700,#FFA500);color:#0f0f1a;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;box-shadow:0 4px 15px rgba(255,215,0,0.3);">
        Reset Password
      </a>
    </div>
    <p style="color:#666;font-size:12px;margin-top:24px;">This link will expire in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
    <p style="color:#444;font-size:10px;word-break:break-all;">Link: ${resetUrl}</p>
  `;

  return sendEmail(to, 'Reset Your Password', emailTemplate(content, 'Password Reset'));
}

async function sendEmail(to, subject, html) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`📧 Email (not sent - no SMTP config): To: ${to}, Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

export default { sendOTPEmail, sendWelcomeEmail, sendWithdrawalEmail, sendPasswordResetEmail };