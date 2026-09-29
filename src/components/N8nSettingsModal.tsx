import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bot,
  Globe,
  Key,
  CheckCircle,
  ExternalLink,
  X,
  Power,
  RotateCcw,
} from 'lucide-react';

const DEFAULT_WEBHOOK_URL =
  'https://madhuridavala.app.n8n.cloud/webhook/aa2ab3fb-cf8a-48f7-ab08-71643fab5322/chat';

interface N8nSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  isEnabled: boolean;
  onSave: (config: { webhookUrl: string; isEnabled: boolean }) => void;
}

export const N8nSettingsModal: React.FC<N8nSettingsModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  isEnabled,
  onSave,
}) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);
  const [localEnabled, setLocalEnabled] = useState(isEnabled);

  useEffect(() => {
    setLocalUrl(webhookUrl);
    setLocalEnabled(isEnabled);
  }, [webhookUrl, isEnabled, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      webhookUrl: localUrl.trim() || DEFAULT_WEBHOOK_URL,
      isEnabled: localEnabled,
    });
    onClose();
  };

  const handleResetDefault = () => {
    setLocalUrl(DEFAULT_WEBHOOK_URL);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">n8n Chatbot Settings</h2>
              <p className="text-xs text-orange-100">
                Connect your n8n webhook workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  localEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Enable n8n Chatbot</h4>
                <p className="text-xs text-slate-500">
                  {localEnabled ? 'Chatbot widget is active on the page' : 'Widget is turned off'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localEnabled}
                onChange={(e) => setLocalEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* n8n Webhook URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-orange-500" />
                <span>n8n Webhook Chat URL</span>
              </label>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-orange-600 hover:text-orange-700 underline font-medium inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to latest URL</span>
              </button>
            </div>
            <input
              type="url"
              required
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://madhuridavala.app.n8n.cloud/webhook/aa2ab3fb-cf8a-48f7-ab08-71643fab5322/chat"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-all"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              The full endpoint configured in your n8n "Chat Trigger" or "Webhook" node.
            </p>
          </div>

          {/* Details card */}
          <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200/80 text-xs text-orange-900 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>Configured Endpoint:</span>
            </div>
            <p className="text-orange-800/90 text-[11px] leading-relaxed break-all font-mono">
              {localUrl}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <a
                href={localUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-900"
              >
                <span>Test endpoint in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-sm hover:shadow transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
