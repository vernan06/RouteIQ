// src/components/SortBars.jsx
import React from 'react';

export default function SortBars({
  values = [],
  comparing = [],
  swapping = [],
  sorted = []
}) {
  const maxVal = Math.max(...values, 1);

  return (
    <div className="w-full h-64 bg-[#0c1020] border border-[#ffffff0a] rounded-lg p-4 flex items-end gap-1.5 justify-center relative overflow-hidden select-none">
      {/* Decorative background grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
        <div className="border-b border-[#ffffff12] w-full" />
        <div className="border-b border-[#ffffff12] w-full" />
        <div className="border-b border-[#ffffff12] w-full" />
        <div className="border-b border-[#ffffff12] w-full" />
      </div>

      {values.map((val, idx) => {
        const heightPercent = (val / maxVal) * 85 + 10; // at least 10% height

        // Determine color
        let barColor = '';
        let glowClass = '';
        
        if (swapping.includes(idx)) {
          // Swap: red flash
          barColor = 'bg-rose-500';
          glowClass = 'shadow-[0_0_12px_rgba(244,63,94,0.5)]';
        } else if (comparing.includes(idx)) {
          // Compare: yellow highlight
          barColor = 'bg-amber-400';
          glowClass = 'shadow-[0_0_12px_rgba(251,191,36,0.5)]';
        } else if (sorted.includes(idx)) {
          // Sorted: calm teal
          barColor = 'bg-teal-500';
          glowClass = 'shadow-[0_0_8px_rgba(20,184,166,0.3)]';
        } else {
          // Default: color gradient from green (low) to red (high)
          // HSL: 120 (Green) to 0 (Red)
          const ratio = val / maxVal;
          const hue = (1 - ratio) * 120; // 120 is green, 0 is red
          barColor = `hsl(${hue}, 80%, 45%)`;
        }

        return (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center justify-end h-full group relative"
          >
            {/* Value Tooltip */}
            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[#0f1628] border border-[#ffffff1a] text-[9px] font-mono text-white px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
              Priority: {val.toFixed(1)}
            </div>

            {/* Visual Bar */}
            <div
              className={`w-full rounded-t transition-all duration-150 ${glowClass}`}
              style={{
                height: `${heightPercent}%`,
                backgroundColor: barColor.startsWith('bg-') ? undefined : barColor
              }}
              // If it's a tailwind bg class, apply via className, else inline style
              {...(barColor.startsWith('bg-') ? { className: `w-full rounded-t transition-all duration-100 ${barColor} ${glowClass}` } : {})}
            />

            {/* Label index */}
            <span className="text-[8px] font-mono text-textMuted mt-1 scale-90">
              {idx}
            </span>
          </div>
        );
      })}
    </div>
  );
}
