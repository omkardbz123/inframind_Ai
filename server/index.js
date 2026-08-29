import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));

// Helper to create Nodemailer transporter
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, ''), // remove any spaces
    },
  });
}

// 1. Health check & configuration status
app.get('/api/health', (req, res) => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const isConfigured = Boolean(user && pass && pass.length >= 10);

  res.json({
    status: 'ok',
    configured: isConfigured,
    senderEmail: user || null,
    message: isConfigured
      ? `Gmail SMTP active (Sender: ${user})`
      : 'Waiting for Gmail user and App Password in .env',
  });
});

// 2. Save / Update Gmail configuration dynamically
app.post('/api/save-config', (req, res) => {
  try {
    const { gmailUser, gmailAppPassword } = req.body;

    if (gmailUser) process.env.GMAIL_USER = gmailUser.trim();
    if (gmailAppPassword) process.env.GMAIL_APP_PASSWORD = gmailAppPassword.replace(/\s+/g, '');

    // Write to .env file
    const envContent = `# MIT ACSC CampusCare Environment Configuration
GMAIL_USER=${process.env.GMAIL_USER || ''}
GMAIL_APP_PASSWORD=${process.env.GMAIL_APP_PASSWORD || ''}
PORT=${process.env.PORT || 5000}
VITE_GEMINI_API_KEY=${process.env.VITE_GEMINI_API_KEY || ''}
`;
    fs.writeFileSync(envPath, envContent, 'utf-8');

    return res.json({
      success: true,
      senderEmail: process.env.GMAIL_USER,
      message: 'Gmail credentials updated and saved to .env',
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Send transactional email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, attachments, replyTo } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const transporter = getTransporter();

    if (!transporter) {
      console.warn(`[Nodemailer] Warning: GMAIL_USER or GMAIL_APP_PASSWORD not set. Email simulated.`);
      return res.status(200).json({
        success: false,
        simulated: true,
        message: 'Gmail credentials not configured in .env. Logged to prototype simulator.',
      });
    }

    const mailOptions = {
      from: `"MIT ACSC CampusCare" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.GMAIL_USER,
      attachments: attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Email successfully sent to ${to}: ${info.messageId}`);

    return res.json({
      success: true,
      messageId: info.messageId,
      recipient: to,
    });
  } catch (error) {
    console.error('[Nodemailer Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch email via Gmail SMTP',
    });
  }
});

// 4. Send test email
app.post('/api/test-email', async (req, res) => {
  try {
    const { recipient } = req.body;
    const targetEmail = recipient || process.env.GMAIL_USER;

    if (!targetEmail) {
      return res.status(400).json({ error: 'Please provide recipient email.' });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(400).json({
        success: false,
        error: 'GMAIL_USER or GMAIL_APP_PASSWORD is not set.',
      });
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #821930; padding: 24px; text-align: center; border-bottom: 3px solid #d97706;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">MIT ACSC CampusCare</h1>
            <p style="color: #fde68a; margin: 6px 0 0 0; font-size: 13px;">Smart Campus Infrastructure & Maintenance Portal</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="color: #821930; margin-top: 0; font-size: 18px;">✅ Live Gmail SMTP Connection Verified!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Hello! This is a test email sent from your personal Gmail account via <strong>Nodemailer + Google SMTP</strong> to test the <strong>CampusCare</strong> automated mailing system.
            </p>
            <div style="background-color: #fdf2f4; border: 1px solid #f8cfd6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px; color: #475569;">
                <tr><td style="font-weight: bold; width: 140px; color: #821930;">Sender Account:</td><td>${process.env.GMAIL_USER}</td></tr>
                <tr><td style="font-weight: bold; color: #821930;">Recipient:</td><td>${targetEmail}</td></tr>
                <tr><td style="font-weight: bold; color: #821930;">Timestamp:</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
                <tr><td style="font-weight: bold; color: #821930;">College:</td><td>MAEER's MIT ACSC, Alandi (D.), Pune</td></tr>
              </table>
            </div>
            <p style="font-size: 13px; color: #64748b;">
              Campus fault tickets, CCTV night LED failure alerts, technician dispatch notifications, and PDF work orders will now be automatically emailed in real time!
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 14px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
            MIT Arts, Commerce & Science College, Alandi (D.), Pune - 412105
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"MIT ACSC CampusCare" <${process.env.GMAIL_USER}>`,
      to: targetEmail,
      subject: '✅ [TEST SUCCESS] MIT ACSC CampusCare Live Gmail Integration',
      html: testHtml,
    });

    console.log(`[Test Mail Sent]: Delivered to ${targetEmail} (MessageId: ${info.messageId})`);

    return res.json({
      success: true,
      message: `Test email successfully delivered to ${targetEmail}! Check your inbox.`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('[Nodemailer Test Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email. Check if your Gmail address is correct.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MIT ACSC CampusCare Mail Backend Server Running`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Sender Gmail: ${process.env.GMAIL_USER || 'Not set'}`);
  console.log(`  App Password: [CONFIGURED]`);
  console.log(`=======================================================`);
});
