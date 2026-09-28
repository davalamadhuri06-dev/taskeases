import React from 'react';
import {
  CheckCircle,
  Clock,
  Flame,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { DashboardStatistics } from '../types/task';

interface DashboardStatsProps {
  stats: DashboardStatistics;
  onFilterSelect?: (filter: 'all' | 'pending' | 'completed' | 'high') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  onFilterSelect,
}) => {
  return (
    <div className="space-y-4">
      {/* Productivity Banner with dynamic message */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white shadow-lg shadow-indigo-950/20 border border-indigo-900/40">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Productivity Status
              </span>
              <span className="text-xs text-indigo-200/80 font-medium">
                {stats.completedTasks} of {stats.totalTasks} tasks finished
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {stats.productivityMessage}
            </h2>
          </div>

          {/* Completion Percentage Gauge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 shrink-0">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.completionPercentage}%
              </div>
              <div className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
                Completed
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${stats.completionPercentage}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-emerald-300">
                {stats.completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar line */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <button
          type="button"
          onClick={() => onFilterSelect?.('all')}
          className="text-left group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-sans">
            {stats.totalTasks}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">All active & archived</p>
        </button>

        {/* Pending Tasks */}
        <button
          type="button"
          onClick={() => onFilterSelect?.('pending')}
          className="text-left group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-sans">
            {stats.pendingTasks}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Tasks to be done</p>
        </button>

        {/* Completed Tasks */}
        <button
          type="button"
          onClick={() => onFilterSelect?.('completed')}
          className="text-left group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-sans">
            {stats.completedTasks}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Checked off</p>
        </button>

        {/* High Priority Tasks */}
        <button
          type="button"
          onClick={() => onFilterSelect?.('high')}
          className="text-left group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-rose-300 shadow-sm hover:shadow transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              High Priority
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-sans">
            {stats.highPriorityTasks}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Urgent & important</p>
        </button>
      </div>
    </div>
  );
};
