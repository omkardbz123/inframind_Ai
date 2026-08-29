import React, { useState, useEffect } from 'react';
import { Mail, FileText, CheckCircle2, AlertTriangle, Send, RefreshCw, X, Settings } from 'lucide-react';
import {
  getSentEmails,
  SentEmailRecord,
  checkMailServerHealth,
  sendLiveTestEmail,
} from '../../lib/emailSimulator';
import { useTicketStore } from '../../store/ticketStore';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';

interface EmailSentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSentHistoryModal: React.FC<EmailSentHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { tickets } = useTicketStore();

  const [serverHealth, setServerHealth] = useState<{
    online: boolean;
    configured: boolean;
    senderEmail: string | null;
    message: string;
  }>({
    online: true,
    configured: true,
    senderEmail: null,
    message: 'Checking status...',
  });

  const [showConfig, setShowConfig] = useState(false);
  const [senderGmail, setSenderGmail] = useState('');
  const [appPasswordInput, setAppPasswordInput] = useState('');
  const [configSaveMsg, setConfigSaveMsg] = useState('');

  const [testEmailAddress, setTestEmailAddress] = useState('5454317@mitacsc.edu.in');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const fetchHealth = () => {
    checkMailServerHealth().then((res) => {
      setServerHealth(res);
      if (res.senderEmail) {
        setSenderGmail(res.senderEmail);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const logs = getSentEmails();

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaveMsg('');

    try {
      const res = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmailUser: senderGmail,
          gmailAppPassword: appPasswordInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigSaveMsg('Gmail configuration saved successfully!');
        fetchHealth();
        setTimeout(() => setShowConfig(false), 1200);
      }
    } catch {
      setConfigSaveMsg('Error saving configuration.');
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;

    setIsSendingTest(true);
    setTestResult(null);

    const result = await sendLiveTestEmail(testEmailAddress);
    setIsSendingTest(false);
    setTestResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-h-[92vh] flex flex-col space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-maroon-50 text-maroon-800 rounded-2xl border border-maroon-200">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Nodemailer & Live Email Service
              </h3>
              <p className="text-xs text-slate-500">
                Automated campus work orders, CCTV night defect alerts, and test mailer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 text-slate-500 hover:text-maroon-800 rounded-xl hover:bg-slate-100 border border-slate-200"
              title="Gmail Configuration Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Server Status Pill */}
            <div
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${
                serverHealth.online && serverHealth.configured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverHealth.online && serverHealth.configured
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
              <span>
                {serverHealth.online && serverHealth.configured
                  ? `Gmail Active (${serverHealth.senderEmail})`
                  : 'Configure Sender Gmail'}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Config Drawer */}
        {showConfig && (
          <form onSubmit={handleSaveConfig} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Sender Account Credentials:</span>
              {configSaveMsg && <span className="text-emerald-700 font-semibold">{configSaveMsg}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Your Sender Gmail Address:</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={senderGmail}
                  onChange={(e) => setSenderGmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">16-Char Google App Password:</label>
                <input
                  type="password"
                  placeholder="vxnn rkpw ezpx jwud"
                  value={appPasswordInput}
                  onChange={(e) => setAppPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-maroon-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl font-bold shadow-xs"
              >
                Save Sender Settings
              </button>
            </div>
          </form>
        )}

        {/* Live Test Mailer Box */}
        <div className="p-4 bg-maroon-50/60 rounded-2xl border border-maroon-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-maroon-950 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-maroon-800" />
              <span>Send Live Test Email to Personal Inbox:</span>
            </div>
            <span className="text-[10px] text-maroon-800 font-medium">Google SMTP</span>
          </div>

          <form onSubmit={handleSendTest} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="Enter recipient email (e.g. 5454317@mitacsc.edu.in)"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
            />
            <button
              type="submit"
              disabled={isSendingTest}
              className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending via Gmail...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </>
              )}
            </button>
          </form>

          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{testResult.message || testResult.error}</span>
            </div>
          )}
        </div>

        {/* Email Logs List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs font-bold text-slate-700">Outbound Email History & Dispatch Queue:</div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No transactional emails dispatched yet.
            </div>
          ) : (
            logs.map((log: SentEmailRecord) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-maroon-800">To: {log.to}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white border border-slate-200 text-slate-700">
                      {log.template}
                    </span>
                    {log.deliveryStatus === 'sent_live' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                        LIVE SENT (Gmail)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.sentAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-bold text-slate-900">{log.subject}</div>

                <div
                  className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed max-h-36 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: log.htmlContent }}
                />

                {log.hasPdfAttachment && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <FileText className="w-3.5 h-3.5 text-maroon-800" />
                      Attached: {log.pdfFileName || 'MIT-ACSC-WorkOrder.pdf'}
                    </span>
                    {tickets.length > 0 && (
                      <button
                        onClick={() => downloadTicketReportPDF(tickets[0])}
                        className="px-3 py-1 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
