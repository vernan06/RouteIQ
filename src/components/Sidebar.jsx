// src/components/Sidebar.jsx
import React from 'react';

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', algo: 'Dijkstra/Feed', color: '#3b82f6' }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'route-optimizer', label: 'Route Optimizer', algo: 'Dijkstra', color: '#8b5cf6' },
      { id: 'fleet-sorter', label: 'Fleet Sorter', algo: 'Sort Suite', color: '#10b981' },
      { id: 'network-mapper', label: 'Network Mapper', algo: 'FW/DFS/BFS', color: '#f59e0b' }
    ]
  },
  {
    title: 'PLANNING',
    items: [
      { id: 'budget-allocator', label: 'Budget Allocator', algo: 'DP Knapsack', color: '#ef4444' },
      { id: 'scheduler', label: 'Scheduler', algo: 'Backtrack Suite', color: '#06b6d4' },
      { id: 'grid-planner', label: 'Grid Planner', algo: 'Prim/Huffman', color: '#84cc16' }
    ]
  },
  {
    title: 'TOOLS',
    items: [
      { id: 'document-search', label: 'Document Search', algo: 'Boyer-Moore', color: '#ec4899' },
      { id: 'ticket-queue', label: 'Ticket Queue', algo: 'Priority Queue', color: '#f97316' }
    ]
  }
];

export default function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <aside className="w-[220px] shrink-0 bg-[#0c1020] border-r border-[#ffffff12] flex flex-col h-screen overflow-y-auto select-none">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-[#ffffff12] flex items-center gap-3">
        <svg className="w-8 h-8 text-primaryAccent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 22 19.5 12 26 2 19.5 2 8.5" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="12" cy="14" r="3" fill="#3b82f6" />
        </svg>
        <div>
          <h1 className="text-sm font-semibold tracking-wider text-white">RouteIQ</h1>
          <p className="text-[10px] text-textSecondary font-light leading-none">Operations Platform</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.title} className="mb-4">
            <h3 className="px-4 text-[10px] font-bold tracking-widest text-[#475569] mb-1.5">{group.title}</h3>
            <ul className="space-y-0.5">
              {group.items.map(item => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between text-xs transition-all duration-150 border-l-2 ${
                        isActive
                          ? 'bg-[#3b82f61f] text-[#93c5fd] border-[#3b82f6]'
                          : 'text-textSecondary hover:bg-[#ffffff05] hover:text-textPrimary border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-[9px] scale-90 text-textMuted bg-[#1e293b] px-1 py-0.5 rounded uppercase font-mono tracking-tight text-right shrink-0">
                        {item.algo}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Info Bottom Footer */}
      <div className="p-4 border-t border-[#ffffff12] flex items-center gap-3 bg-[#090d1a]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
          VF
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-medium text-white truncate">Vernan F.</h4>
          <p className="text-[9px] text-textSecondary truncate font-mono">RVCE · BCS401</p>
        </div>
        <span className="text-[9px] font-mono text-[#475569]">v1.0.0</span>
      </div>
    </aside>
  );
}
