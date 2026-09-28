import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Task, ChatMessage } from '../types/task';
import { processUserRequest } from '../services/aiAssistantEngine';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onTasksUpdate: (updatedTasks: Task[], notificationMessage?: string) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onTasksUpdate,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text:
        `👋 Welcome to **TaskEase**! I'm your AI Assistant.\n\n` +
        `I can help you create, manage, check off, and review your tasks using natural language.\n\n` +
        `Try asking:\n` +
        `• "What do I need to do today?"\n` +
        `• "Add a high priority task to complete Java assignment tomorrow"\n` +
        `• "Complete Web Technology Project Report"\n` +
        `• "What's pending?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: "What do I need to do today?", actionPrompt: "What do I need to do today?" },
        { label: "What's pending?", actionPrompt: "What's pending?" },
        { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
        { label: "How is my progress?", actionPrompt: "What are my stats?" },
      ],
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process using AI Assistant Engine with natural language understanding
    setTimeout(() => {
      const result = processUserRequest(query, tasks);

      if (result.updatedTasks) {
        let notification = 'Tasks updated';
        if (result.executedAction?.type === 'add') {
          notification = `Added "${result.executedAction.taskTitle}"`;
        } else if (result.executedAction?.type === 'complete') {
          notification = `Completed "${result.executedAction.taskTitle}"`;
        } else if (result.executedAction?.type === 'reopen') {
          notification = `Reopened "${result.executedAction.taskTitle}"`;
        } else if (result.executedAction?.type === 'delete') {
          notification = `Deleted "${result.executedAction.taskTitle}"`;
        } else if (result.executedAction?.type === 'edit') {
          notification = `Updated "${result.executedAction.taskTitle}"`;
        }

        onTasksUpdate(result.updatedTasks, notification);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: result.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: result.suggestedActions,
        disambiguationTasks: result.disambiguationTasks,
        matchedTasks: result.matchedTasks,
        executedAction: result.executedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. How can I help you organize your tasks today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: "What do I need to do today?", actionPrompt: "What do I need to do today?" },
          { label: "What's pending?", actionPrompt: "What's pending?" },
          { label: "Show high priority tasks", actionPrompt: "Show high priority tasks" },
        ],
      },
    ]);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-white border-l border-slate-200/90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:px-5 sm:py-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center backdrop-blur-sm border border-white/15">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  TaskEase AI Assistant
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Natural language task manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear chat history"
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close assistant"
              className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time State Synced Notification Pill */}
        <div className="bg-indigo-50/80 px-4 py-1.5 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-800">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Synced directly with your task list & localStorage
          </span>
          <span className="text-indigo-600/80 font-mono text-[10px]">
            {tasks.length} tasks
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 text-sm shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {/* Content formatting */}
                <div className="whitespace-pre-wrap leading-relaxed font-sans">
                  {msg.text}
                </div>

                {/* Disambiguation Task Selectors if multiple matched */}
                {msg.disambiguationTasks && msg.disambiguationTasks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Select target task:
                    </p>
                    {msg.disambiguationTasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSendMessage(`Complete ${t.title}`)}
                        className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 ml-2 uppercase font-bold shrink-0">
                          {t.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Confirmation Badge */}
                {msg.executedAction && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Updated in TaskEase</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>

              {/* Suggested Follow-up Actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(action.actionPrompt)}
                      className="px-2.5 py-1 rounded-full text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all font-medium text-left"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 w-fit text-slate-400">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Quick Commands */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
          {/* Quick Suggestions Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleSendMessage("What do I need to do today?")}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              Today's tasks
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("What's pending?")}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Show high priority tasks")}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              High Priority
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("What are my stats?")}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              Stats
            </button>
          </div>

          {/* Form */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask or command... (e.g. 'Complete project report')"
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Powered by TaskEase AI Engine</span>
            <span>Key: taskease_tasks_v1</span>
          </div>
        </div>
      </aside>
    </>
  );
};
