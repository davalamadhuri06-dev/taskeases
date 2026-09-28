import React from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
} from 'lucide-react';
import { FilterType, SortType } from '../types/task';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    high: number;
  };
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  counts,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Sort:</span>
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className="py-2 pl-3 pr-8 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-xs"
          >
            <option value="due_earliest">Due Date — Earliest</option>
            <option value="due_latest">Due Date — Latest</option>
            <option value="priority_high_low">Priority — High to Low</option>
            <option value="recently_added">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline-flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filter:
        </span>

        {/* All Tasks */}
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Tasks</span>
          <span
            className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-slate-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* Pending */}
        <button
          type="button"
          onClick={() => onFilterChange('pending')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'pending'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
          <span
            className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'pending'
                ? 'bg-sky-700 text-sky-100'
                : 'bg-sky-50 text-sky-700'
            }`}
          >
            {counts.pending}
          </span>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => onFilterChange('completed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
          <span
            className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'completed'
                ? 'bg-emerald-700 text-emerald-100'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {counts.completed}
          </span>
        </button>

        {/* High Priority */}
        <button
          type="button"
          onClick={() => onFilterChange('high')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'high'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>High Priority</span>
          <span
            className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'high'
                ? 'bg-rose-700 text-rose-100'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {counts.high}
          </span>
        </button>
      </div>
    </div>
  );
};
