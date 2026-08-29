import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, ''),
    },
  });
}

// Built-in Email & SMTP API Middleware for Vite
function emailApiPlugin() {
  return {
    name: 'email-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Helper to parse JSON body
        const getBody = () =>
          new Promise<any>((resolve) => {
            let data = '';
            req.on('data', (chunk: any) => (data += chunk));
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });

        res.setHeader('Content-Type', 'application/json');

        // 1. Health check
        if (req.url === '/api/health' && req.method === 'GET') {
          const user = process.env.GMAIL_USER;
          const pass = process.env.GMAIL_APP_PASSWORD;
          const isConfigured = Boolean(user && pass && pass.length >= 10);

          res.end(
            JSON.stringify({
              status: 'ok',
              configured: isConfigured,
              senderEmail: user || null,
              message: isConfigured
                ? `Gmail SMTP active (Sender: ${user})`
                : 'Waiting for Gmail user and App Password in .env',
            })
          );
          return;
        }

        // 2. Save Config
        if (req.url === '/api/save-config' && req.method === 'POST') {
          const body = await getBody();
          const { gmailUser, gmailAppPassword } = body;

          if (gmailUser) process.env.GMAIL_USER = gmailUser.trim();
          if (gmailAppPassword) process.env.GMAIL_APP_PASSWORD = gmailAppPassword.replace(/\s+/g, '');

          const envPath = path.resolve(__dirname, '.env');
          const envContent = `# MIT ACSC CampusCare Environment Configuration
GMAIL_USER=${process.env.GMAIL_USER || ''}
GMAIL_APP_PASSWORD=${process.env.GMAIL_APP_PASSWORD || ''}
PORT=5180
VITE_GEMINI_API_KEY=${process.env.VITE_GEMINI_API_KEY || ''}
`;
          fs.writeFileSync(envPath, envContent, 'utf-8');

          res.end(
            JSON.stringify({
              success: true,
              senderEmail: process.env.GMAIL_USER,
              message: 'Gmail credentials updated successfully!',
            })
          );
          return;
        }

        // 3. Test Email
        if (req.url === '/api/test-email' && req.method === 'POST') {
          const body = await getBody();
          const { recipient } = body;
          const targetEmail = recipient || process.env.GMAIL_USER;

          if (!targetEmail) {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'No recipient email specified.' }));
            return;
          }

          const transporter = getTransporter();
          if (!transporter) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: 'GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env.',
              })
            );
            return;
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
                    Hello! This is a live test email sent via <strong>Nodemailer + Google SMTP</strong> to test the <strong>MIT ACSC CampusCare</strong> automated mailing system.
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

          try {
            const info = await transporter.sendMail({
              from: `"MIT ACSC CampusCare" <${process.env.GMAIL_USER}>`,
              to: targetEmail,
              subject: '✅ [TEST SUCCESS] MIT ACSC CampusCare Live Gmail Integration',
              html: testHtml,
            });

            res.end(
              JSON.stringify({
                success: true,
                message: `Test email successfully delivered to ${targetEmail}! Check your inbox.`,
                messageId: info.messageId,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                success: false,
                error: err.message || 'Failed to dispatch email via Google SMTP.',
              })
            );
          }
          return;
        }

        // 4. Transactional Send Email
        if (req.url === '/api/send-email' && req.method === 'POST') {
          const body = await getBody();
          const { to, subject, html, attachments } = body;

          const transporter = getTransporter();
          if (!transporter) {
            res.end(
              JSON.stringify({
                success: false,
                simulated: true,
                message: 'Gmail credentials not configured. Recorded to simulator.',
              })
            );
            return;
          }

          try {
            const info = await transporter.sendMail({
              from: `"MIT ACSC CampusCare" <${process.env.GMAIL_USER}>`,
              to,
              subject,
              html,
              attachments: attachments || [],
            });

            res.end(JSON.stringify({ success: true, messageId: info.messageId }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5180,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    emailApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MIT ACSC CampusCare — Smart Campus Infrastructure & Maintenance',
        short_name: 'CampusCare',
        description: 'AI-Powered Campus Fault Reporting and Predictive Maintenance System',
        theme_color: '#821930',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
