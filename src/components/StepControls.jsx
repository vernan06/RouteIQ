// src/components/StepControls.jsx
import React from 'react';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

export default function StepControls({
  steps = [],
  currentStep = 0,
  isPlaying = false,
  speed = 1,
  play,
  pause,
  stepForward,
  stepBack,
  reset,
  setSpeed,
  jumpToStep
}) {
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const handleProgressClick = (e) => {
    if (totalSteps <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    const targetStep = Math.round(clickPercent * (totalSteps - 1));
    jumpToStep?.(Math.max(0, Math.min(totalSteps - 1, targetStep)));
  };

  const handleLastStep = () => {
    if (totalSteps > 0) {
      jumpToStep?.(totalSteps - 1);
    }
  };

  return (
    <div className="bg-[#0f1628] border border-[#ffffff12] rounded-lg p-3 flex flex-col gap-2.5 shadow-lg select-none">
      {/* Progress Bar & Frame Count */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-textSecondary w-10 shrink-0">
          St. {currentStep}
        </span>
        <div
          onClick={handleProgressClick}
          className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden cursor-pointer relative group"
        >
          <div
            className="h-full bg-primaryAccent transition-all duration-100 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Hover scrubber indicator */}
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#ffffff05] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-[10px] font-mono text-textSecondary w-10 shrink-0 text-right">
          Tot. {Math.max(0, totalSteps - 1)}
        </span>
      </div>

      {/* Main control row */}
      <div className="flex items-center justify-between gap-4">
        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={reset}
            disabled={totalSteps <= 1}
            title="Reset"
            className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-textSecondary hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <SkipBack size={12} fill="currentColor" />
          </button>
          
          <button
            onClick={stepBack}
            disabled={totalSteps <= 1 || currentStep === 0}
            title="Previous Step"
            className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-textSecondary hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={12} fill="currentColor" />
          </button>

          <button
            onClick={isPlaying ? pause : play}
            disabled={totalSteps <= 1}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-2 rounded bg-primaryAccent hover:bg-blue-600 text-white transition-colors disabled:opacity-30 disabled:pointer-events-none shadow shadow-blue-500/20"
          >
            {isPlaying ? (
              <Pause size={14} fill="white" stroke="white" />
            ) : (
              <Play size={14} fill="white" stroke="white" />
            )}
          </button>

          <button
            onClick={stepForward}
            disabled={totalSteps <= 1 || currentStep === totalSteps - 1}
            title="Next Step"
            className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-textSecondary hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={12} fill="currentColor" />
          </button>

          <button
            onClick={handleLastStep}
            disabled={totalSteps <= 1 || currentStep === totalSteps - 1}
            title="Jump to End"
            className="p-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-textSecondary hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <SkipForward size={12} fill="currentColor" />
          </button>
        </div>

        {/* Speed slider */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-textSecondary shrink-0">Speed:</span>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={speed}
            onChange={(e) => setSpeed?.(parseFloat(e.target.value))}
            disabled={totalSteps <= 1}
            className="w-16 h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-primaryAccent disabled:opacity-40"
          />
          <span className="text-[9px] font-mono text-textSecondary w-8 text-right shrink-0">
            {speed.toFixed(2)}x
          </span>
        </div>
      </div>
    </div>
  );
}
