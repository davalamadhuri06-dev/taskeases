import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Plus,
  Bot,
  RotateCcw,
  Calendar,
  Sliders,
} from 'lucide-react';
import { formatDateToDisplay, getTodayDateString } from '../utils/dateUtils';

interface HeaderProps {
  onOpenNewTaskModal: () => void;
  onToggleAiAssistant: () => void;
  isAiDrawerOpen: boolean;
  onResetDemoData: () => void;
  onOpenN8nSettings?: () => void;
  n8nEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTaskModal,
  onToggleAiAssistant,
  isAiDrawerOpen,
  onResetDemoData,
  onOpenN8nSettings,
  n8nEnabled = true,
}) => {
  const todayStr = getTodayDateString();
  const formattedToday = formatDateToDisplay(todayStr);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  TaskEase
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  v1.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
                Organize Your Day
              </p>
            </div>
          </div>

          {/* Date indicator & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Today Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Today: {formattedToday}</span>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetDemoData}
              title="Reset to demo task data"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            {/* n8n Chatbot Settings Button */}
            {onOpenN8nSettings && (
              <button
                onClick={onOpenN8nSettings}
                title="Configure n8n Chatbot Webhook"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  n8nEnabled
                    ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 hover:border-orange-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden xl:inline">n8n Setup</span>
                <span className="xl:hidden">n8n</span>
                <span className={`w-1.5 h-1.5 rounded-full ${n8nEnabled ? 'bg-orange-500' : 'bg-slate-400'}`}></span>
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              onClick={onToggleAiAssistant}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                isAiDrawerOpen
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 hover:border-indigo-300'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </button>

            {/* New Task Button */}
            <button
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
