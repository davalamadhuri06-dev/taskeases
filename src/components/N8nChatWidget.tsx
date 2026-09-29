import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Radio,
  SlidersHorizontal,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Task } from '../types/task';
import {
  buildComprehensiveWebsiteContext,
  buildContextualizedPrompt,
} from '../utils/websiteContext';

interface N8nChatWidgetProps {
  webhookUrl: string;
  tasks: Task[];
  isOpen?: boolean;
  onToggleOpen?: () => void;
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
  tasks,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onToggleOpen) {
      if (open !== isOpen) onToggleOpen();
    } else {
      setInternalIsOpen(open);
    }
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'charts' | 'embed'>('chat');
  const [copied, setCopied] = useState(false);

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi! I'm connected to your n8n workflow. Ask me questions, brainstorm, or let me assist you with your tasks!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 11)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanUrl = webhookUrl.trim();

  // Extract webhook ID for display
  const webhookIdMatch = cleanUrl.match(/webhook\/([^/]+)/);
  const displayWebhookId = webhookIdMatch ? webhookIdMatch[1] : 'aa2ab3fb';

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
        text: 'Chat history reset. How can I assist you with your workflow?',
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
      // Build comprehensive website, task, and workspace context for n8n AI Agent
      const siteData = buildComprehensiveWebsiteContext(tasks);
      const contextualizedPrompt = buildContextualizedPrompt(query, tasks);

      // We send both the rich contextualized prompt in chatInput/message/text (so the n8n LLM agent always sees it
      // even if the n8n workflow only reads $json.chatInput or $json.message) AND structured fields.
      const payload = {
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: contextualizedPrompt,
        message: contextualizedPrompt,
        text: contextualizedPrompt,
        userQuery: query,
        rawQuery: query,
        websiteData: siteData,
        context: siteData,
        metadata: {
          source: 'TaskEase',
          applicationName: siteData.application.name,
          platform: siteData.application.platform,
          currentDate: siteData.application.currentDate,
          activeTasksCount: siteData.metrics.totalTasks,
          pendingTasksCount: siteData.metrics.pendingTasks,
          completedTasksCount: siteData.metrics.completedTasks,
          completionRate: `${siteData.metrics.completionPercentage}%`,
          highPriorityCount: siteData.metrics.highPriorityTasks,
          productivityStatus: siteData.metrics.productivityMessage,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            priority: t.priority,
            dueDate: t.dueDate,
            completed: t.completed,
          })),
          pendingTasks: siteData.taskBreakdown.pending,
          completedTasks: siteData.taskBreakdown.completed,
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
          `n8n webhook returned status ${response.status} (${response.statusText})`
        );
      }

      let botReply = '';
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        // Support common n8n AI agent / Chat trigger response schemas
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
          text: botReply || 'Workflow executed successfully.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      console.warn('n8n webhook request notice:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to communicate with n8n webhook.';

      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'system',
          isError: true,
          text: `⚠️ **n8n Status**: ${errorMessage}\n\n*Checklist:*\n1. Confirm the workflow is set to **Active** in n8n Cloud.\n2. Ensure the "When Chat Message Received" node has chat enabled.\n3. You can also view the embedded mode using the **Embed** tab above.`,
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
      <div className="fixed bottom-6 right-6 z-30 flex items-center">
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
              Live
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
                  {displayWebhookId.substring(0, 14)}...
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
                title="Open webhook endpoint in new window"
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

          {/* Subheader tab switch & status */}
          <div className="bg-orange-50/90 px-3.5 py-1.5 border-b border-orange-100 flex items-center justify-between text-[11px] text-orange-950 font-medium shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse shrink-0" />
              <span className="truncate font-mono text-[10px] text-orange-900">
                madhuridavala.app.n8n.cloud
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'chat'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-orange-800 hover:bg-orange-200/60'
                }`}
              >
                <span>Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('charts')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'charts'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-orange-800 hover:bg-orange-200/60'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Charts & Data</span>
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
                      n8n workflow is responding...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt chips */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'Review and analyze all my current website and task data in charts and give me a complete productivity report')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 whitespace-nowrap transition-colors font-medium flex items-center gap-1 shrink-0"
                >
                  📊 Send all website data & charts
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'Give me a priority distribution and deadline chart breakdown of my tasks')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors font-medium shrink-0"
                >
                  📈 Priority & schedule chart
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'Summarize my pending tasks with overdue warnings')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors font-medium shrink-0"
                >
                  📋 Summarize tasks
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, 'What should I prioritize today?')}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors font-medium shrink-0"
                >
                  ⚡ Plan priorities
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
          ) : activeTab === 'charts' ? (
            /* Tab 2: Visual Charts & Report */
            (() => {
              const siteContext = buildComprehensiveWebsiteContext(tasks);
              const { summary, priorityBreakdown, statusBreakdown, scheduleBreakdown } = siteContext.charts;

              return (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs">
                  {/* Top Action Banner */}
                  <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 rounded-xl p-3 text-white flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-sm">Live Website Chart Data</h4>
                      <p className="text-[11px] text-orange-100">
                        {summary.total} tasks tracked &bull; {summary.completionPercentage}% completed
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage(undefined, 'Review and analyze all my current website and task data in charts and give me a complete productivity report');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Charts to AI</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tasks</span>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">{summary.total}</p>
                      <span className="text-[10px] text-indigo-600 font-medium">TaskEase Board</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
                      <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{summary.completed}</p>
                      <span className="text-[10px] text-emerald-700 font-medium">{summary.completionPercentage}% Done</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Pending</span>
                      <p className="text-xl font-extrabold text-amber-600 mt-0.5">{summary.pending}</p>
                      <span className="text-[10px] text-amber-700 font-medium">{100 - summary.completionPercentage}% Remaining</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">High Priority</span>
                      <p className="text-xl font-extrabold text-rose-600 mt-0.5">{summary.highPriority}</p>
                      <span className="text-[10px] text-rose-700 font-medium">{summary.overdueCount} Overdue</span>
                    </div>
                  </div>

                  {/* Chart Card 1: Completion Progress Bar */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                        Completion Ratio Chart
                      </span>
                      <span className="font-bold text-emerald-600">{summary.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${summary.completionPercentage}%` }}
                        title={`Completed: ${summary.completionPercentage}%`}
                      />
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${100 - summary.completionPercentage}%` }}
                        title={`Pending: ${100 - summary.completionPercentage}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Completed: {summary.completed} tasks ({statusBreakdown.completed.percentage}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Pending: {summary.pending} tasks ({statusBreakdown.pending.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Chart Card 2: Priority Distribution Bar Chart */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      Priority Distribution Chart
                    </span>

                    {/* High Priority Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-rose-700">High Priority</span>
                        <span className="font-semibold text-slate-700">
                          {priorityBreakdown.high.count} tasks ({priorityBreakdown.high.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${priorityBreakdown.high.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium Priority Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-amber-700">Medium Priority</span>
                        <span className="font-semibold text-slate-700">
                          {priorityBreakdown.medium.count} tasks ({priorityBreakdown.medium.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${priorityBreakdown.medium.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Low Priority Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-blue-700">Low Priority</span>
                        <span className="font-semibold text-slate-700">
                          {priorityBreakdown.low.count} tasks ({priorityBreakdown.low.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${priorityBreakdown.low.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chart Card 3: Deadline & Schedule Status */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Pending Schedule Breakdown
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                        <span className="text-[10px] text-rose-600 font-semibold block">Overdue</span>
                        <span className="text-lg font-bold text-rose-700">{scheduleBreakdown.overdue.count}</span>
                        <span className="text-[9px] text-rose-500 block">{scheduleBreakdown.overdue.percentage}% of pending</span>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                        <span className="text-[10px] text-amber-600 font-semibold block">Due Today</span>
                        <span className="text-lg font-bold text-amber-700">{scheduleBreakdown.dueToday.count}</span>
                        <span className="text-[9px] text-amber-500 block">{scheduleBreakdown.dueToday.percentage}% of pending</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] text-emerald-600 font-semibold block">Upcoming</span>
                        <span className="text-lg font-bold text-emerald-700">{scheduleBreakdown.upcoming.count}</span>
                        <span className="text-[9px] text-emerald-500 block">{scheduleBreakdown.upcoming.percentage}% of pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button to Send to AI Agent */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(undefined, 'Review and analyze all my current website and task data in charts and give me a complete productivity report');
                    }}
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send this Live Chart & Data Report to n8n AI Agent</span>
                  </button>
                </div>
              );
            })()
          ) : (
            /* Tab 3: Embedded View */
            <div className="relative flex-1 w-full bg-slate-50 overflow-hidden flex flex-col">
              <iframe
                src={cleanUrl}
                title="n8n Webhook Chatbot"
                className="w-full flex-1 border-0"
                allow="clipboard-write; clipboard-read; microphone; camera"
              />
              <div className="p-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate">Webhook: {displayWebhookId}</span>
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
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
