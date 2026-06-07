// src/components/KPICard.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPICard({ label, value, delta, deltaType, icon: Icon, color = 'blue' }) {
  const isUp = deltaType === 'up';

  const accentColorClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  };

  const selectedColor = accentColorClasses[color] || accentColorClasses.blue;

  return (
    <div className="bg-[#111827] border border-[#ffffff12] rounded-lg p-4 flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-150 hover:border-[#ffffff1f]">
      {/* Decorative gradient light */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl pointer-events-none" />

      <div className="space-y-1.5 z-10">
        <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest block">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white tracking-tight">{value}</span>
          {delta && (
            <span className={`flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
            }`}>
              {isUp ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
              {delta}
            </span>
          )}
        </div>
      </div>

      {Icon && (
        <div className={`p-2.5 rounded-lg border z-10 ${selectedColor}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
