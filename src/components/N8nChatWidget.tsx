import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  Sparkles,
  ExternalLink,
  Settings,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Globe,
  Radio,
  Sliders,
} from 'lucide-react';
import { Task } from '../types/task';

interface N8nChatWidgetProps {
  webhookUrl: string;
  isEnabled: boolean;
  onOpenSettings: () => void;
  tasks: Task[];
  onTasksUpdate?: (tasks: Task[], message?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export const N8nChatWidget: React.FC<N8nChatWidgetProps> = ({
  webhookUrl,
  isEnabled,
  onOpenSettings,
  tasks,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'embed'>('chat');
  const [copied, setCopied] = useState(false);

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm connected directly to your n8n workflow. Ask me anything, or let me help you with your daily tasks!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanUrl =
    webhookUrl.trim() ||
    'https://madhuridavala.app.n8n.cloud/webhook/aa2ab3fb-cf8a-48f7-ab08-71643fab5322/chat';

  // Extract webhook ID for display
  const webhookIdMatch = cleanUrl.match(/webhook\/([^/]+)/);
  const displayWebhookId = webhookIdMatch ? webhookIdMatch[1] : 'aa2ab3fb-cf8a-48f7-ab08-71643fab5322';

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  if (!isEnabled) {
    return null;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. Send a new message to your n8n workflow!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = (customPrompt || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputValue('');
    setIsLoading(true);

    try {
      const payload = {
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: query,
        message: query,
        metadata: {
          source: 'TaskEase',
          activeTasks: tasks.length,
          tasksSummary: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate,
            completed: t.completed,
          })),
        },
      };

      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `n8n webhook responded with status ${response.status} (${response.statusText})`
        );
      }

      let botReply = '';
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // Support common n8n AI agent response shapes
        botReply =
          data.output ||
          data.text ||
          data.response ||
          data.message ||
          (Array.isArray(data) && (data[0]?.output || data[0]?.text || data[0]?.message)) ||
          JSON.stringify(data, null, 2);
      } else {
        botReply = await response.text();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: botReply || 'Received response from n8n workflow.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      console.warn('n8n webhook error notice:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Unable to connect to n8n webhook.';

      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'system',
          isError: true,
          text: `⚠️ **Webhook Notice**: ${errorMessage}\n\n*Tips:*\n- Ensure your n8n workflow is **Active** (or in "Listen for test event" mode in n8n Cloud).\n- Ensure CORS is permitted or test with the Embed View tab above.\n- Target URL: \`${cleanUrl}\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 sm:right-56 z-30 flex items-center">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="Open n8n Chatbot"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all group"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
              </span>
            </div>
            <span className="text-sm font-semibold">n8n Chat</span>
            <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20">
              Active
            </span>
          </button>
        )}
      </div>

      {/* Floating Interactive Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
            isExpanded
              ? 'inset-4 sm:inset-10 w-auto h-auto max-w-5xl mx-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[590px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center border border-white/25 shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white truncate">n8n AI Chatbot</h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40 shrink-0"></span>
                </div>
                <p className="text-[11px] text-orange-100 font-mono truncate">
                  ID: {displayWebhookId.substring(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Copy URL */}
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy webhook URL"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Direct Link */}
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open webhook in new tab"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Expand / Minimize */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={onOpenSettings}
                title="Configure n8n Webhook"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader view switcher & status */}
          <div className="bg-orange-50/90 px-3.5 py-1.5 border-b border-orange-100 flex items-center justify-between text-[11px] text-orange-950 font-medium shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="flex items-center gap-1 text-orange-800 font-semibold truncate">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span className="truncate">{cleanUrl.replace('https://', '')}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-orange-800 hover:bg-orange-200/60'
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('embed')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeTab === 'embed'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-orange-800 hover:bg-orange-200/60'
                }`}
              >
                Embed
              </button>
            </div>
          </div>

          {/* Tab 1: Live Interactive Chat */}
          {activeTab === 'chat' ? (
            <>
              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs sm:text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-br-xs'
                          : msg.isError
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 w-fit text-slate-400 shadow-2xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-500 ml-1 font-medium">
                      n8n workflow is thinking...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt chips */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'Summarize my current task list')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors font-medium"
                >
                  📋 Summarize tasks
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'What should I prioritize today?')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors font-medium"
                >
                  ⚡ Plan priorities
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'Hello! Check workflow connection')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors font-medium"
                >
                  👋 Ping n8n
                </button>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => handleSendMessage(e)}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask n8n workflow..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Tab 2: Embedded View (iframe preview of the webhook / assistant) */
            <div className="relative flex-1 w-full bg-slate-50 overflow-hidden flex flex-col">
              <iframe
                src={cleanUrl}
                title="n8n Webhook Chatbot"
                className="w-full flex-1 border-0"
                allow="clipboard-write; clipboard-read; microphone; camera"
              />
              <div className="p-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Webhook: {displayWebhookId}</span>
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Open standalone</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Bottom metadata footer */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <span>Session: {sessionId}</span>
            <span>TaskEase Context Attached</span>
          </div>
        </div>
      )}
    </>
  );
};
