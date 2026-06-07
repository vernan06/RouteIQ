// src/pages/BudgetAllocator.jsx
import React, { useState, useEffect } from 'react';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { knapsack01, fractionalKnapsack, binomialCoeff } from '../algorithms/dp';
import { ShieldCheck, Layers, HelpCircle, HelpCircle as HelpIcon, TrendingUp, Cpu } from 'lucide-react';

const INITIAL_PROJECTS = [
  { id: 1, name: 'Road Repair', cost: 20, benefit: 6, forceInclude: false, forceExclude: false },
  { id: 2, name: 'Water Pipeline', cost: 30, benefit: 8, forceInclude: false, forceExclude: false },
  { id: 3, name: 'Street Lights', cost: 10, benefit: 4, forceInclude: false, forceExclude: false },
  { id: 4, name: 'Parks Renovation', cost: 15, benefit: 5, forceInclude: false, forceExclude: false },
  { id: 5, name: 'Primary School', cost: 25, benefit: 7, forceInclude: false, forceExclude: false },
  { id: 6, name: 'Public Hospital', cost: 40, benefit: 9, forceInclude: false, forceExclude: false },
  { id: 7, name: 'Metro Station', cost: 50, benefit: 10, forceInclude: false, forceExclude: false },
  { id: 8, name: 'CCTV Cameras', cost: 12, benefit: 5, forceInclude: false, forceExclude: false },
  { id: 9, name: 'Waste Mgmt', cost: 18, benefit: 6, forceInclude: false, forceExclude: false },
  { id: 10, name: 'Solar Panels', cost: 8, benefit: 3, forceInclude: false, forceExclude: false }
];

export default function BudgetAllocator() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [budget, setBudget] = useState(100); // 10L to 150L
  const [selectedAlgo, setSelectedAlgo] = useState('01kp'); // 01kp | fractional
  const [memoryFunctions, setMemoryFunctions] = useState(false); // Memory Functions grid toggle
  const [kCombinations, setKCombinations] = useState(5); // k for C(10, k)
  
  // Binomial Coefficient data
  const [binomData, setBinomData] = useState({ table: [], steps: [] });

  const algoEngine = useAlgoEngine([], 3);

  const runKnapsack = () => {
    if (selectedAlgo === '01kp') {
      const { steps } = knapsack01(projects, budget);
      algoEngine.setSteps(steps);
    } else {
      const { steps } = fractionalKnapsack(projects, budget);
      algoEngine.setSteps(steps);
    }
  };

  // Run initial solve & setup Binomial table
  useEffect(() => {
    runKnapsack();
  }, [projects, budget, selectedAlgo]);

  useEffect(() => {
    // Generate C(10, k) data
    const data = binomialCoeff(10, 10);
    setBinomData(data);
  }, []);

  const handleToggleInclude = (id) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const nextInclude = !p.forceInclude;
        return {
          ...p,
          forceInclude: nextInclude,
          forceExclude: nextInclude ? false : p.forceExclude
        };
      }
      return p;
    }));
  };

  const handleToggleExclude = (id) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const nextExclude = !p.forceExclude;
        return {
          ...p,
          forceExclude: nextExclude,
          forceInclude: nextExclude ? false : p.forceInclude
        };
      }
      return p;
    }));
  };

  // Extract variables of the current step
  const currentStepData = algoEngine.steps[algoEngine.currentStep] || {};
  const description = currentStepData.description || 'Idle';
  const traceback = currentStepData.traceback || [];
  const selectedItems = currentStepData.selectedItems || [];

  // Memory Functions calculation (determine which cells are needed top-down)
  const memoVisited = {};
  if (selectedAlgo === '01kp' && memoryFunctions) {
    const solveMemo = (i, w) => {
      if (i === 0 || w <= 0) return;
      const key = `${i},${w}`;
      if (memoVisited[key]) return;
      memoVisited[key] = true;
      const item = projects[i - 1];
      if (item.forceExclude) {
        solveMemo(i - 1, w);
      } else if (item.cost <= w) {
        solveMemo(i - 1, w - item.cost);
        solveMemo(i - 1, w);
      } else {
        solveMemo(i - 1, w);
      }
    };
    solveMemo(projects.length, budget);
  }

  // Calculate stats
  const totalCost = selectedItems.reduce((acc, curr) => {
    const cost = curr.allocatedCost !== undefined ? curr.allocatedCost : curr.cost;
    return acc + cost;
  }, 0);
  const totalBenefit = selectedItems.reduce((acc, curr) => {
    const benefit = curr.allocatedBenefit !== undefined ? curr.allocatedBenefit : curr.benefit;
    return acc + benefit;
  }, 0);

  // Compare 0/1 vs Fractional max benefit for side-by-side callout
  const test01 = knapsack01(projects, budget);
  const testFrac = fractionalKnapsack(projects, budget);
  const diff = testFrac.maxBenefit - test01.maxBenefit;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Project list & Slider controls (1/3 width) */}
      <div className="space-y-6">
        {/* Module Header */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-1">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-budgetAlloc" />
            Budget Allocator
          </h3>
          <p className="text-[10px] text-textSecondary">
            Optimize BBMP infrastructure funding across city development tasks.
          </p>
        </div>

        {/* Budget Setting Slider */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-4">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Budget Settings</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-textSecondary">Total Budget Limit:</span>
              <span className="font-mono text-emerald-400 font-bold">₹{budget}L</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="w-full h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-primaryAccent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-textSecondary uppercase font-mono block">Algorithm Engine</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedAlgo('01kp')}
                className={`py-1.5 text-[10px] font-medium rounded transition-colors ${
                  selectedAlgo === '01kp'
                    ? 'bg-primaryAccent text-white'
                    : 'bg-[#1e293b] text-textSecondary hover:text-white'
                }`}
              >
                0/1 Knapsack (DP)
              </button>
              <button
                onClick={() => setSelectedAlgo('fractional')}
                className={`py-1.5 text-[10px] font-medium rounded transition-colors ${
                  selectedAlgo === 'fractional'
                    ? 'bg-primaryAccent text-white'
                    : 'bg-[#1e293b] text-textSecondary hover:text-white'
                }`}
              >
                Fractional (Greedy)
              </button>
            </div>
          </div>
        </div>

        {/* Project Manifest List */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">BBMP Project Pool</h4>
            <span className="text-[9px] font-mono text-textMuted">10 candidates</span>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {projects.map(proj => (
              <div
                key={proj.id}
                className={`p-2.5 rounded border border-[#ffffff06] flex items-center justify-between transition-colors ${
                  proj.forceInclude
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : proj.forceExclude
                    ? 'bg-rose-500/5 border-rose-500/20'
                    : 'bg-[#0c1020]'
                }`}
              >
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-semibold text-white leading-tight">{proj.name}</h5>
                  <div className="flex gap-2 text-[8px] font-mono text-textSecondary">
                    <span>Cost: ₹{proj.cost}L</span>
                    <span>Benefit: {proj.benefit}/10</span>
                  </div>
                </div>

                {/* Force toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleInclude(proj.id)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-colors ${
                      proj.forceInclude
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#1e293b] text-textSecondary hover:text-white'
                    }`}
                  >
                    Inc
                  </button>
                  <button
                    onClick={() => handleToggleExclude(proj.id)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-colors ${
                      proj.forceExclude
                        ? 'bg-rose-500 text-white'
                        : 'bg-[#1e293b] text-textSecondary hover:text-white'
                    }`}
                  >
                    Exc
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: DP Table animation / Fractional solver (1/3 width) */}
      <div className="space-y-6">
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[480px]">
          {selectedAlgo === '01kp' ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              {/* DP header with memory function toggle */}
              <div className="flex items-center justify-between border-b border-[#ffffff0a] pb-2 shrink-0">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  DP Table Fill State
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-textSecondary font-mono">Memoization:</span>
                  <button
                    onClick={() => setMemoryFunctions(prev => !prev)}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      memoryFunctions ? 'bg-primaryAccent' : 'bg-[#1e293b]'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
                        memoryFunctions ? 'transform translate-x-4' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Grid matrix table scrollable */}
              <div className="flex-1 overflow-auto border border-[#ffffff05] rounded scrollbar-thin min-h-0 bg-[#0c1020]">
                {(() => {
                  const dpTable = currentStepData.dp || [];
                  const activeRow = currentStepData.itemIdx || 0;
                  const activeCol = currentStepData.capIdx || 0;
                  const computed = currentStepData.computedCells || [];

                  if (dpTable.length === 0) return null;

                  // Columns are budget intervals (let's display a column step of 5 or 10 L to fit the viewport!)
                  // Budget is 10 to 150. Let's make columns every 5 units
                  const stepInterval = budget > 50 ? 5 : 2;
                  const displayCols = [];
                  for (let w = 0; w <= budget; w += stepInterval) {
                    displayCols.push(w);
                  }

                  return (
                    <table className="text-[8px] font-mono text-textSecondary w-full border-collapse">
                      <thead>
                        <tr className="bg-[#080b13] border-b border-[#ffffff0a] sticky top-0 z-10">
                          <th className="p-1 text-left text-white sticky left-0 bg-[#080b13] z-20">PROJ</th>
                          {displayCols.map(w => (
                            <th key={w} className="p-1 text-center w-8">
                              ₹{w}L
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((proj, rIdx) => {
                          const dpRowIdx = rIdx + 1;
                          const isRowActive = activeRow === dpRowIdx;

                          return (
                            <tr key={proj.id} className={`border-b border-[#ffffff04] ${
                              isRowActive ? 'bg-primaryAccent/5' : ''
                            }`}>
                              <td className="p-1 font-bold text-textPrimary sticky left-0 bg-[#0c1020] border-r border-[#ffffff08] z-10 max-w-[60px] truncate">
                                {proj.name}
                              </td>
                              {displayCols.map(w => {
                                const val = dpTable[dpRowIdx]?.[w] || 0;
                                const isComputed = computed[dpRowIdx]?.[w];
                                const isTraceback = traceback.some(cell => cell.r === dpRowIdx && cell.c === w);
                                
                                // Memory function masking
                                const isMemoSkipped = memoryFunctions && !memoVisited[`${dpRowIdx},${w}`];

                                let cellColor = '';
                                if (isTraceback) {
                                  cellColor = 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40';
                                } else if (isRowActive && activeCol === w) {
                                  cellColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
                                } else if (isMemoSkipped) {
                                  cellColor = 'opacity-20 text-textMuted bg-[#ffffff02]';
                                }

                                return (
                                  <td
                                    key={w}
                                    className={`p-1 text-center font-mono ${cellColor}`}
                                  >
                                    {isMemoSkipped ? '-' : val}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          ) : (
            // Fractional Knapsack visual list
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-[#ffffff0a] pb-2 shrink-0">
                Greedy Density Selection (Fractional)
              </h4>
              
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin min-h-0">
                {(() => {
                  const sortedItems = currentStepData.sortedItems || [];
                  const currentIdx = currentStepData.currentItemIdx || -1;
                  const currentSelects = currentStepData.selectedItems || [];

                  return sortedItems.map((item, idx) => {
                    const isSelect = currentSelects.find(s => s.id === item.id);
                    const isFocus = currentIdx === idx;
                    const fraction = isSelect ? isSelect.fraction : 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded border transition-all ${
                          isFocus
                            ? 'border-amber-400 bg-amber-500/5'
                            : isSelect
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-[#ffffff05] bg-[#0c1020]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-white">{item.name}</span>
                          <span className="text-[9px] font-mono text-amber-400 font-bold">
                            Ratio: {item.ratio.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-[8px] font-mono text-textSecondary">
                          <span>Cost: ₹{item.cost}L | Benefit: {item.benefit}</span>
                          <span className="font-bold text-emerald-400">
                            Fraction Taken: {(fraction * 100).toFixed(0)}%
                          </span>
                        </div>

                        {fraction > 0 && (
                          <div className="mt-2 w-full h-1 bg-[#1e293b] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: `${fraction * 100}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Results Summary Box */}
          <div className="bg-[#111827] border border-[#ffffff0a] p-3 rounded-lg mt-4 shrink-0 grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#080c18] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase font-mono block">Benefit Score</span>
              <span className="text-sm font-bold text-emerald-400">{totalBenefit.toFixed(2)}</span>
            </div>
            
            <div className="bg-[#080c18] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase font-mono block">Budget Used</span>
              <span className="text-sm font-bold text-white">₹{totalCost.toFixed(1)}L</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Pascal's triangle, Comparisons & Console (1/3 width) */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Pascal's Triangle combo counts */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between border-b border-[#ffffff0a] pb-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={12} className="text-textSecondary" />
              Combinations C(10, k)
            </h4>
            <select
              value={kCombinations}
              onChange={(e) => setKCombinations(parseInt(e.target.value))}
              className="bg-[#0c1020] border border-[#ffffff12] rounded p-0.5 text-[9px] font-mono text-white focus:outline-none"
            >
              {[...Array(11).keys()].map(i => (
                <option key={i} value={i}>k = {i}</option>
              ))}
            </select>
          </div>

          <div className="text-[9px] text-textSecondary leading-normal mb-2">
            Possible subsets selecting <span className="text-white font-bold">{kCombinations}</span> projects out of 10: <span className="text-amber-400 font-bold font-mono text-xs">{(binomData.table[10]?.[kCombinations] || 0)}</span> combinations.
          </div>

          {/* Simple Pascal Grid visualizer */}
          <div className="flex flex-col items-center gap-0.5 max-h-36 overflow-y-auto border border-[#ffffff04] p-2 rounded bg-[#0c1020] font-mono text-[7px] text-textSecondary">
            {binomData.table.map((row, iIdx) => (
              <div key={iIdx} className="flex gap-1.5">
                {row.slice(0, iIdx + 1).map((val, jIdx) => {
                  const isMatch = iIdx === 10 && jIdx === kCombinations;
                  return (
                    <span
                      key={jIdx}
                      className={`w-4 text-center shrink-0 ${
                        isMatch ? 'text-amber-400 font-bold bg-amber-400/10 rounded border border-amber-400/20' : ''
                      }`}
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* DP vs Greedy Comparison Callout */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Engine Efficiency Delta</h4>
          </div>
          
          <div className="bg-[#111827] border border-[#ffffff0a] p-3 rounded-lg text-[10px] space-y-1.5 leading-relaxed">
            <p className="text-textSecondary">
              Comparison at budget <span className="text-white font-semibold">₹{budget}L</span>:
            </p>
            <div className="flex items-center justify-between font-mono text-[9px] bg-[#0c1020] p-1.5 rounded">
              <span>0/1 Benefit: <strong className="text-white">{test01.maxBenefit}</strong></span>
              <span>Frac Benefit: <strong className="text-white">{testFrac.maxBenefit.toFixed(1)}</strong></span>
            </div>
            <p className="text-[9px] text-[#94a3b8] italic bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
              {diff > 0
                ? `Fractional Greedy yields ${diff.toFixed(2)} higher benefit because it splits projects to pack resources fully.`
                : "Both models achieve equal benefit at this budget limit."}
            </p>
          </div>
        </div>

        {/* StepControls */}
        <div className="shrink-0">
          <StepControls {...algoEngine} />
        </div>

        {/* Console Log */}
        <div className="flex-1 min-h-[160px]">
          <AlgoEngineLog
            algoName={selectedAlgo === '01kp' ? "0/1 Knapsack DP Solver" : "Fractional Greedy Solver"}
            timeComplexity={selectedAlgo === '01kp' ? "O(N * W)" : "O(N log N)"}
            spaceComplexity={selectedAlgo === '01kp' ? "O(N * W)" : "O(N)"}
            steps={algoEngine.steps}
            currentStep={algoEngine.currentStep}
            executionTime={selectedAlgo === '01kp' ? "0.22 ms" : "0.05 ms"}
          />
        </div>
      </div>
    </div>
  );
}
