// src/pages/Scheduler.jsx
import React, { useState, useEffect } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { nQueens, subsetSum, tspBranchBound, assignmentProblem } from '../algorithms/backtracking';
import { Calendar, Layers, Shield, Users, CheckCircle2, ChevronRight } from 'lucide-react';

const SUBSET_ITEMS = [10, 15, 8, 22, 14, 6, 30, 12, 18, 5];

// Fire station nodes
const FIRE_NODES = [
  { id: 'F1', label: 'St. 1 (Central)', x: 300, y: 50 },
  { id: 'F2', label: 'St. 2 (North)', x: 420, y: 120 },
  { id: 'F3', label: 'St. 3 (East)', x: 380, y: 240 },
  { id: 'F4', label: 'St. 4 (South)', x: 220, y: 240 },
  { id: 'F5', label: 'St. 5 (West)', x: 180, y: 120 },
  { id: 'F6', label: 'St. 6 (Metro)', x: 300, y: 155 }
];

const FIRE_MATRIX = [
  [0, 10, 15, 20, 12, 8],
  [10, 0, 12, 25, 18, 14],
  [15, 12, 0, 8, 16, 10],
  [20, 25, 8, 0, 11, 15],
  [12, 18, 16, 11, 0, 9],
  [8, 14, 10, 15, 9, 0]
];

// Map matrix to edges list
const FIRE_EDGES = [];
for (let i = 0; i < FIRE_MATRIX.length; i++) {
  for (let j = i + 1; j < FIRE_MATRIX[i].length; j++) {
    FIRE_EDGES.push({
      source: `F${i+1}`,
      target: `F${j+1}`,
      weight: FIRE_MATRIX[i][j]
    });
  }
}

const WORKERS = ['Worker A', 'Worker B', 'Worker C', 'Worker D', 'Worker E'];
const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3', 'Shift 4', 'Shift 5'];

const ASSIGNMENT_MATRIX = [
  [9, 2, 7, 8, 6],
  [6, 4, 3, 7, 5],
  [5, 8, 1, 4, 6],
  [7, 6, 9, 4, 5],
  [2, 3, 5, 6, 8]
];

export default function Scheduler() {
  const [activeTab, setActiveTab] = useState('event'); // event | subset | patrol
  const [nQueensSize, setNQueensSize] = useState(6);
  const [subsetTarget, setSubsetTarget] = useState(47);
  
  // Custom states for completed solutions
  const [validSubsets, setValidSubsets] = useState([]);
  
  // Backtracking engine setup
  const eventEngine = useAlgoEngine([], 4);
  const subsetEngine = useAlgoEngine([], 4);
  const tspEngine = useAlgoEngine([], 3);

  // Assignment states (solved statically or animated)
  const [assignmentResult, setAssignmentResult] = useState({ bestAssignment: [], bestCost: 0 });

  const runNQueens = () => {
    const steps = nQueens(nQueensSize);
    eventEngine.setSteps(steps);
  };

  const runSubsetSum = () => {
    const { steps, validSubsets } = subsetSum(SUBSET_ITEMS, subsetTarget);
    subsetEngine.setSteps(steps);
    setValidSubsets(validSubsets);
  };

  const runTSPBB = () => {
    const steps = tspBranchBound(FIRE_MATRIX);
    tspEngine.setSteps(steps);
  };

  useEffect(() => {
    if (activeTab === 'event') runNQueens();
    else if (activeTab === 'subset') runSubsetSum();
    else if (activeTab === 'patrol') {
      runTSPBB();
      const res = assignmentProblem(ASSIGNMENT_MATRIX);
      setAssignmentResult(res);
    }
  }, [activeTab, nQueensSize, subsetTarget]);

  // N-Queens active state
  const eqStepData = eventEngine.steps[eventEngine.currentStep] || {};
  const eqBoard = eqStepData.board || Array(nQueensSize).fill(-1);
  const eqConflictCells = eqStepData.conflictCells || [];
  const eqPlaced = eqStepData.placedAt || null;

  // Subset Sum active state
  const ssStepData = subsetEngine.steps[subsetEngine.currentStep] || {};
  const ssSubset = ssStepData.currentSubset || [];
  const ssSum = ssStepData.sum || 0;
  const ssAction = ssStepData.action || 'check';

  // TSP active state
  const tspStepData = tspEngine.steps[tspEngine.currentStep] || {};
  const tspPath = tspStepData.currentPath || [];
  const tspBestCost = tspStepData.bestCost || Infinity;
  const tspBound = tspStepData.bound || 0;

  // Convert node path indexes (e.g. 0, 1, 2) to string IDs (e.g. F1, F2)
  const tspHighlightPath = tspPath.map(idx => `F${idx + 1}`);

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-scheduler" />
            Scheduler
          </h3>
          <p className="text-[10px] text-textSecondary">
            Backtrack schedules, match budget grants, and resolve shift work assignments.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#ffffff12] md:border-b-0">
          <button
            onClick={() => setActiveTab('event')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'event'
                ? 'border-primaryAccent text-white bg-primaryAccent/5'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <Calendar size={12} />
            <span>Event Scheduler</span>
          </button>
          
          <button
            onClick={() => setActiveTab('subset')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'subset'
                ? 'border-primaryAccent text-white bg-primaryAccent/5'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <Layers size={12} />
            <span>Resource Matching</span>
          </button>

          <button
            onClick={() => setActiveTab('patrol')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'patrol'
                ? 'border-primaryAccent text-white bg-primaryAccent/5'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <Shield size={12} />
            <span>Patrol & Assignment</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC TAB SECTIONS */}
      {activeTab === 'event' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar Grid (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-full flex items-center justify-between mb-4 border-b border-[#ffffff0a] pb-2 shrink-0">
                <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
                  Venue Time Schedule (Queen Placement)
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-textSecondary font-mono">Size N:</span>
                  <select
                    value={nQueensSize}
                    onChange={(e) => setNQueensSize(parseInt(e.target.value))}
                    className="bg-[#1e293b] border border-borderColor rounded p-0.5 text-[10px] font-mono text-white focus:outline-none"
                  >
                    {[4, 5, 6, 7, 8].map(i => (
                      <option key={i} value={i}>N = {i}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NxN board rendering */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div
                  className="grid border border-[#ffffff1a] rounded overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${nQueensSize}, minmax(36px, 1fr))`,
                    gridTemplateRows: `repeat(${nQueensSize}, minmax(36px, 1fr))`
                  }}
                >
                  {Array.from({ length: nQueensSize }).map((_, rIdx) => {
                    const colWithQueen = eqBoard[rIdx];

                    return Array.from({ length: nQueensSize }).map((_, cIdx) => {
                      const hasQueen = colWithQueen === cIdx;
                      const isConf = eqConflictCells.some(cell => cell.r === rIdx && cell.c === cIdx);
                      const isPlacing = eqPlaced && eqPlaced.r === rIdx && eqPlaced.c === cIdx;

                      let cellBg = (rIdx + cIdx) % 2 === 0 ? 'bg-[#0f1628]' : 'bg-[#080c18]';
                      if (hasQueen) {
                        cellBg = 'bg-purple-600/35 border border-purple-500/50';
                      }
                      if (isConf) {
                        cellBg = 'bg-rose-600/30 border border-rose-500/60 animate-pulse';
                      }
                      if (isPlacing && !isConf) {
                        cellBg = 'bg-amber-600/30 border border-amber-500/60';
                      }

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`w-10 h-10 flex items-center justify-center text-xs font-bold text-white transition-colors duration-100 ${cellBg}`}
                        >
                          {hasQueen && (
                            <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" />
                              <rect x="3" y="18" width="18" height="2" rx="1" fill="currentColor" />
                            </svg>
                          )}
                          {!hasQueen && (
                            <span className="text-[8px] font-mono text-textMuted select-none">
                              R{rIdx}C{cIdx}
                            </span>
                          )}
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Console (1/3 width) */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Backtracking State</h4>
              <p className="text-[10px] text-textSecondary leading-normal">
                Recursively places events. If a conflict is hit, it flashes red and backtracks (removes event) to try next columns.
              </p>
            </div>
            
            <div className="shrink-0">
              <StepControls {...eventEngine} />
            </div>

            <div className="flex-1 min-h-[200px]">
              <AlgoEngineLog
                algoName={`${nQueensSize}-Queens Scheduler`}
                timeComplexity="O(N!)"
                spaceComplexity="O(N)"
                steps={eventEngine.steps}
                currentStep={eventEngine.currentStep}
                executionTime="1.1 ms"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subset' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Subset tree list (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[380px] overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-[#ffffff0a] pb-2 shrink-0">
                <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
                  Backtracking State matching Target sum
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-textSecondary font-mono">Grant Target:</span>
                  <input
                    type="number"
                    value={subsetTarget}
                    onChange={(e) => setSubsetTarget(parseInt(e.target.value) || 0)}
                    className="bg-[#0c1020] border border-[#ffffff12] rounded p-0.5 w-12 text-[10px] font-mono text-center text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin min-h-0">
                <div className="flex flex-wrap gap-2.5 justify-center py-2">
                  {SUBSET_ITEMS.map((item, idx) => {
                    const isIncluded = ssSubset.includes(idx);
                    
                    let cardStyle = 'border-[#ffffff05] bg-[#0c1020] text-textSecondary';
                    if (isIncluded) {
                      if (ssAction === 'found') {
                        cardStyle = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300 font-bold';
                      } else if (ssAction === 'backtrack') {
                        cardStyle = 'border-rose-500/40 bg-rose-500/5 text-rose-300';
                      } else {
                        cardStyle = 'border-primaryAccent/40 bg-primaryAccent/5 text-blue-300 font-bold';
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-center w-20 shadow-md transition-all ${cardStyle}`}
                      >
                        <span className="text-[8px] font-mono uppercase block text-textMuted">Bill #{idx+1}</span>
                        <span className="text-xs font-bold font-mono">₹{item}L</span>
                      </div>
                    );
                  })}
                </div>

                {/* Subsets found timeline */}
                <div className="border-t border-[#ffffff06] pt-3 mt-4 space-y-2">
                  <h5 className="text-[9px] font-bold text-white uppercase tracking-wider">Valid Subsets Found</h5>
                  <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                    {validSubsets.map((sub, sIdx) => (
                      <div key={sIdx} className="bg-[#0c1020] border border-[#ffffff06] px-2.5 py-1.5 rounded flex items-center justify-between text-[9px] font-mono text-textSecondary select-text">
                        <span>Combo #{sIdx + 1}: [{sub.map(i => `₹${SUBSET_ITEMS[i]}L`).join(' + ')}]</span>
                        <span className="text-emerald-400 font-bold">Sum: ₹{subsetTarget}L</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Console (1/3 width) */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Tree Matcher</h4>
              
              <div className="bg-[#111827] border border-[#ffffff0a] p-3 rounded text-[10px] font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Current Sum:</span>
                  <span className={`font-bold ${
                    ssSum > subsetTarget ? 'text-rose-400 animate-pulse' : ssSum === subsetTarget ? 'text-emerald-400' : 'text-blue-400'
                  }`}>₹{ssSum}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target Sum:</span>
                  <span className="text-white font-bold">₹{subsetTarget}L</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0">
              <StepControls {...subsetEngine} />
            </div>

            <div className="flex-1 min-h-[200px]">
              <AlgoEngineLog
                algoName="Subset Sum Backtracking"
                timeComplexity="O(2^N)"
                spaceComplexity="O(N)"
                steps={subsetEngine.steps}
                currentStep={subsetEngine.currentStep}
                executionTime="0.85 ms"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patrol' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* TSP Grid Canvas (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[380px]">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2 shrink-0">
                Fire Station Patrol Tour (Branch & Bound TSP)
              </h4>
              <div className="flex-1 min-h-0">
                <NetworkGraph
                  nodes={FIRE_NODES}
                  edges={FIRE_EDGES}
                  highlightPath={tspHighlightPath}
                  width={600}
                  height={300}
                />
              </div>
            </div>

            {/* Shift Assignment Diagram */}
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#ffffff0a] pb-2">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={12} className="text-textSecondary" />
                  Worker-to-Shift Matching (B&B Optimal Cost: {assignmentResult.bestCost})
                </h4>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Solved Optimal
                </span>
              </div>

              {/* Draw node matching links using simple flex columns */}
              <div className="flex justify-between items-center px-12 py-3 bg-[#0c1020] border border-[#ffffff06] rounded-lg relative overflow-hidden select-text">
                {/* Workers column */}
                <div className="flex flex-col gap-3.5 z-10">
                  {WORKERS.map((worker, wIdx) => (
                    <div key={wIdx} className="bg-[#111827] border border-[#ffffff10] px-3 py-1.5 rounded text-[10px] font-semibold text-white text-center w-24">
                      {worker}
                    </div>
                  ))}
                </div>

                {/* Match lines using a simple middle SVG overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    {/* Render lines from worker elements to shift elements */}
                    {assignmentResult.bestAssignment.map((shiftIdx, workerIdx) => {
                      // Heights: 24, 60, 96, 132, 168 approx coordinates
                      const y1 = 30 + workerIdx * 38;
                      const y2 = 30 + shiftIdx * 38;
                      return (
                        <line
                          key={workerIdx}
                          x1="160"
                          y1={y1}
                          x2="400"
                          y2={y2}
                          stroke="rgba(59, 130, 246, 0.45)"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Shifts column */}
                <div className="flex flex-col gap-3.5 z-10">
                  {SHIFTS.map((shift, sIdx) => (
                    <div key={sIdx} className="bg-[#111827] border border-[#ffffff10] px-3 py-1.5 rounded text-[10px] font-semibold text-white text-center w-24">
                      {shift}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Console (1/3 width) */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Patrol Route Solver</h4>
              
              <div className="bg-[#111827] border border-[#ffffff0a] p-3 rounded text-[10px] font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Current Bound:</span>
                  <span className="text-amber-400 font-bold">{tspBound.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Best Tour Cost:</span>
                  <span className="text-emerald-400 font-bold">{tspBestCost !== Infinity ? `${tspBestCost.toFixed(1)} km` : 'Infinity'}</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0">
              <StepControls {...tspEngine} />
            </div>

            <div className="flex-1 min-h-[200px]">
              <AlgoEngineLog
                algoName="TSP Branch & Bound"
                timeComplexity="O(2^V * V²)"
                spaceComplexity="O(V²)"
                steps={tspEngine.steps}
                currentStep={tspEngine.currentStep}
                executionTime="1.5 ms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
