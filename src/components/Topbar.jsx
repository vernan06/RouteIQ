// src/components/Topbar.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Download, Play, Activity } from 'lucide-react';

const PAGE_NAMES = {
  'dashboard': 'Dashboard Overview',
  'route-optimizer': 'Route Optimizer',
  'fleet-sorter': 'Fleet Sorter',
  'network-mapper': 'Network Mapper',
  'budget-allocator': 'Budget Allocator',
  'scheduler': 'Scheduler',
  'document-search': 'Document Search',
  'grid-planner': 'Grid Planner',
  'ticket-queue': 'Ticket Queue'
};

const PAGE_BREADCRUMBS = {
  'dashboard': ['Overview', 'Analytics'],
  'route-optimizer': ['Operations', 'Shortest Paths'],
  'fleet-sorter': ['Operations', 'Priority Sorting'],
  'network-mapper': ['Operations', 'Topology Check'],
  'budget-allocator': ['Planning', 'Optimal Knapsack'],
  'scheduler': ['Planning', 'Backtracking Schedules'],
  'grid-planner': ['Planning', 'Spanning Networks'],
  'document-search': ['Tools', ' civic Records search'],
  'ticket-queue': ['Tools', 'Max Heap Queue']
};

export default function Topbar({ currentPage, onRunModule, onImportCSV, onExportReport }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const name = PAGE_NAMES[currentPage] || 'RouteIQ Platform';
  const breadcrumbs = PAGE_BREADCRUMBS[currentPage] || ['Platform'];

  return (
    <header className="h-[52px] bg-[#0c1020] border-b border-[#ffffff12] flex items-center justify-between px-6 select-none shrink-0">
      {/* Breadcrumb / Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[10px] text-textSecondary font-mono uppercase tracking-wider">
          <span>RouteIQ</span>
          <span>/</span>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc}>
              {idx > 0 && <span className="scale-75">/</span>}
              <span>{bc}</span>
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-xs font-semibold text-white tracking-wide leading-tight mt-0.5">{name}</h2>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Live Clock */}
        <div className="text-xs font-mono text-textSecondary bg-[#0f1628] px-3 py-1 rounded border border-[#ffffff0a] shadow-inner flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>{formatTime(time)}</span>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-2 bg-[#0f1628] px-3 py-1 rounded border border-[#ffffff0a] text-[10px] font-mono text-textSecondary">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span>Engine Active</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-l border-[#ffffff12] pl-4">
          <button
            onClick={onImportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-textSecondary hover:text-textPrimary bg-[#0f1628] hover:bg-[#ffffff05] border border-[#ffffff12] rounded transition-colors duration-150"
          >
            <Upload size={12} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-textSecondary hover:text-textPrimary bg-[#0f1628] hover:bg-[#ffffff05] border border-[#ffffff12] rounded transition-colors duration-150"
          >
            <Download size={12} />
            <span>Export Report</span>
          </button>
          
          {currentPage !== 'dashboard' && (
            <button
              onClick={onRunModule}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-white bg-primaryAccent hover:bg-blue-600 rounded transition-colors duration-150 shadow shadow-blue-500/20"
            >
              <Play size={12} fill="white" />
              <span>Run Engine</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
