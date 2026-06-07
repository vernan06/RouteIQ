// src/components/AlgoEngineLog.jsx
import React, { useEffect, useRef } from 'react';
import { Terminal, Cpu, Clock } from 'lucide-react';

export default function AlgoEngineLog({
  algoName,
  timeComplexity,
  spaceComplexity,
  steps = [],
  currentStep = 0,
  executionTime = '0.12 ms'
}) {
  const containerRef = useRef(null);

  // Auto-scroll to the bottom of the log when currentStep changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentStep, steps]);

  // Extract descriptions for steps up to the currentStep
  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <div className="bg-[#0b0f19] border border-[#ffffff12] rounded-lg shadow-xl flex flex-col h-full overflow-hidden select-none">
      {/* Terminal Header */}
      <div className="bg-[#080b12] px-4 py-2 border-b border-[#ffffff0a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-textSecondary" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-textSecondary uppercase">AlgoEngine Console</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 flex-1 flex flex-col min-h-0 bg-[#0c1020]">
        {/* Info badges row */}
        <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-[#ffffff08] shrink-0">
          <div className="text-[10px] font-semibold text-white tracking-wide shrink-0">
            {algoName || 'Select Algorithm'}
          </div>
          {timeComplexity && (
            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
              Time: {timeComplexity}
            </span>
          )}
          {spaceComplexity && (
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
              Space: {spaceComplexity}
            </span>
          )}
          <span className="flex items-center gap-1 text-[9px] font-mono text-textSecondary ml-auto shrink-0">
            <Clock size={10} />
            <span>Exec: {executionTime}</span>
          </span>
        </div>

        {/* Scrollable log area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-[#94a3b8] space-y-2 min-h-0 pr-1 scrollbar-thin"
        >
          {visibleSteps.length === 0 ? (
            <div className="text-textMuted italic py-8 text-center select-text">
              Console idle. Trigger an algorithm run to populate trace logs.
            </div>
          ) : (
            visibleSteps.map((step, idx) => {
              const isLast = idx === visibleSteps.length - 1;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 select-text ${
                    isLast ? 'text-blue-400 border-l border-blue-500/30 pl-1.5' : 'pl-2'
                  }`}
                >
                  <span className={`shrink-0 ${isLast ? 'text-blue-500 animate-pulse' : 'text-textMuted'}`}>
                    [{idx}]
                  </span>
                  <p className="break-all">{step.description || `Step ${idx} executed successfully.`}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Status bar */}
        <div className="pt-2 mt-2 border-t border-[#ffffff05] flex items-center justify-between text-[9px] font-mono text-textMuted shrink-0">
          <span>Frame: {currentStep + 1} / {Math.max(1, steps.length)}</span>
          <span>Buffer: {steps.length} frames</span>
        </div>
      </div>
    </div>
  );
}
