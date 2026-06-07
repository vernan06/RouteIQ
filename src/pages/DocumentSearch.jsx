// src/pages/DocumentSearch.jsx
import React, { useState, useEffect } from 'react';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { boyerMoore, horspool, naiveSearch } from '../algorithms/stringMatch';
import { Search, ListFilter, HelpCircle, BarChart, AlignLeft } from 'lucide-react';

const CIVIC_TEXT = `BENGALURU WARD COMMITTEE MEETING MINUTES (WARD 150 - BELLANDUR)
DATE: JUNE 06, 2026.
AGENDA: WATER SUPPLY STABILITY AND GARBAGE DISPOSAL IN OUTER RING ROAD SECTORS.
The committee raised concerns about irregular water supply from BWSSB. Tender notice BBMP/2026/EL/084 has been issued for digging three new borewells in Kasavanahalli. Phase 2 of road construction from Kaikondrahalli to Bellandur lake is delayed due to utility shifting. Residents complained about waste management services; garbage trucks are skipping scheduled timings. The contractor was warned that penalty clauses under section 4(b) of the waste management contract will be invoked if services do not improve immediately. Next ward committee meeting is scheduled for July 11, 2026 at the Bellandur Ward Office. CCTV installation near Sarjapur junction is also approved.`;

const DEFAULT_PATTERN = "Bellandur";

const MUNICIPAL_QUERIES = [
  'BWSSB', 'BBMP', 'Tender', 'borewells', 'lake', 'garbage', 'trucks', 'penalty', 'contract',
  'Sarjapur', 'Kasavanahalli', 'Bellandur', 'Outer', 'Ring', 'Road', 'delayed', 'water', 'supply', 'waste', 'CCTV'
].sort(() => Math.random() - 0.5); // shuffle

export default function DocumentSearch() {
  const [text, setText] = useState(CIVIC_TEXT);
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [selectedAlgo, setSelectedAlgo] = useState('bm'); // bm | horspool | naive

  // Presorting demo states
  const [presortRunning, setPresortRunning] = useState(false);
  const [linearComparisons, setLinearComparisons] = useState(0);
  const [binaryComparisons, setBinaryComparisons] = useState(0);
  const [queryProgress, setQueryProgress] = useState(0);

  const algoEngine = useAlgoEngine([], 3.5);

  const runSearch = () => {
    if (!pattern) return;
    let steps = [];
    if (selectedAlgo === 'bm') {
      steps = boyerMoore(text, pattern);
    } else if (selectedAlgo === 'horspool') {
      const res = horspool(text, pattern);
      steps = res.steps;
    } else {
      steps = naiveSearch(text, pattern);
    }
    algoEngine.setSteps(steps);
  };

  useEffect(() => {
    runSearch();
  }, [text, pattern, selectedAlgo]);

  const currentStepData = algoEngine.steps[algoEngine.currentStep] || {};
  const currentPos = currentStepData.position || 0;
  const currentComparing = currentStepData.comparing || [];
  const currentMatched = currentStepData.matched || [];
  const badCharTable = currentStepData.badChar || {};
  const goodSuffixTable = currentStepData.goodSuffix || [];
  const shiftTable = currentStepData.shiftTable || {};

  // Calculate comparisons / skips / matches
  let totalComparisons = 0;
  let totalSkips = 0;
  let matchesFound = 0;

  for (let idx = 0; idx <= algoEngine.currentStep; idx++) {
    const step = algoEngine.steps[idx] || {};
    if (step.comparing && step.comparing.length > 0) {
      totalComparisons++;
    }
    if (step.skip && step.skip > 0) {
      totalSkips += step.skip;
    }
    if (step.matched && step.matched.length === pattern.length) {
      matchesFound++;
    }
  }

  // Presorting side-by-side demo loop
  const startPresortDemo = () => {
    setPresortRunning(true);
    setLinearComparisons(0);
    setBinaryComparisons(0);
    setQueryProgress(0);

    const sortedList = [...MUNICIPAL_QUERIES].sort();

    let qIdx = 0;
    const interval = setInterval(() => {
      if (qIdx >= MUNICIPAL_QUERIES.length) {
        clearInterval(interval);
        setPresortRunning(false);
        return;
      }

      const q = MUNICIPAL_QUERIES[qIdx];
      
      // 1. Linear scan simulation
      let linCount = 0;
      for (let i = 0; i < MUNICIPAL_QUERIES.length; i++) {
        linCount++;
        if (MUNICIPAL_QUERIES[i] === q) break;
      }

      // 2. Binary search simulation
      let binCount = 0;
      let low = 0, high = sortedList.length - 1;
      while (low <= high) {
        binCount++;
        const mid = Math.floor((low + high) / 2);
        if (sortedList[mid] === q) break;
        if (sortedList[mid] < q) low = mid + 1;
        else high = mid - 1;
      }

      setLinearComparisons(prev => prev + linCount);
      setBinaryComparisons(prev => prev + binCount);
      setQueryProgress(qIdx + 1);
      qIdx++;
    }, 150);
  };

  // Generate character view window to prevent horizontal overflow in text overlay
  const renderTextWindow = () => {
    // Show a 50-character slice around currentPos
    const windowStart = Math.max(0, currentPos - 15);
    const windowEnd = Math.min(text.length, currentPos + pattern.length + 35);
    const windowText = text.slice(windowStart, windowEnd);

    return (
      <div className="font-mono text-xs leading-relaxed space-y-2 select-text">
        {/* Document Text Line */}
        <div className="relative bg-[#080c18] p-3 rounded border border-[#ffffff05] overflow-x-auto whitespace-pre">
          <span className="text-textMuted">...</span>
          {windowText.split('').map((char, idx) => {
            const actualIdx = windowStart + idx;
            
            // Check if this index is currently compared or matched
            const isComparing = currentComparing.find(c => c.textIdx === actualIdx);
            const isMatched = currentMatched.includes(actualIdx);

            let charColor = 'text-[#e2e8f0]';
            let charBg = '';
            
            if (isComparing) {
              const matchedChar = text[actualIdx] === pattern[isComparing.patIdx];
              charBg = matchedChar ? 'bg-emerald-500/20' : 'bg-rose-500/25';
              charColor = matchedChar ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
            } else if (isMatched) {
              charBg = 'bg-emerald-500/15';
              charColor = 'text-emerald-400';
            }

            return (
              <span key={idx} className={`${charBg} ${charColor} px-0.5 rounded transition-all`}>
                {char}
              </span>
            );
          })}
          <span className="text-textMuted">...</span>
        </div>

        {/* Pattern Sliding Line */}
        <div className="relative bg-[#0c1020] p-3 rounded border border-[#ffffff05] overflow-x-auto whitespace-pre">
          {/* Pad with spaces to align with windowText position */}
          <span>{' '.repeat(Math.max(0, currentPos - windowStart + 3))}</span>
          {pattern.split('').map((char, idx) => {
            // Check if this pattern index is being compared
            const isComparing = currentComparing.find(c => c.patIdx === idx);
            let charColor = 'text-[#64748b]';
            let charBg = '';

            if (isComparing) {
              const isMatch = text[currentPos + idx] === pattern[idx];
              charBg = isMatch ? 'bg-emerald-500/25' : 'bg-rose-500/30';
              charColor = isMatch ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold';
            }

            return (
              <span key={idx} className={`${charBg} ${charColor} px-0.5 rounded border border-transparent`}>
                {char}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Input & Text visualizer (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Module Header */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-docSearch" />
              Document Search
            </h3>
            <p className="text-[10px] text-textSecondary">
              Scan civic reports for patterns instantly using Boyer-Moore and Horspool slide rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-textSecondary font-mono uppercase">Algorithm:</span>
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              className="bg-[#1e293b] border border-borderColor rounded px-2 py-1 text-[11px] font-medium text-white focus:outline-none"
            >
              <option value="bm">Boyer-Moore</option>
              <option value="horspool">Horspool's</option>
              <option value="naive">Naive Search</option>
            </select>
          </div>
        </div>

        {/* Input Text Area */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] text-textSecondary uppercase font-mono block">Civic Record Document (Bengaluru Ward 150)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="4"
                className="w-full bg-[#0c1020] border border-[#ffffff12] rounded p-2 text-[10.5px] font-sans text-white focus:outline-none focus:border-primaryAccent scrollbar-thin select-text"
              />
            </div>

            <div className="w-48 space-y-3.5 shrink-0 self-start mt-4">
              <div className="space-y-1">
                <label className="text-[9px] text-textSecondary uppercase font-mono block">Pattern Keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="w-full bg-[#0c1020] border border-[#ffffff12] rounded pl-7 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-primaryAccent"
                  />
                  <Search size={12} className="absolute left-2.5 top-2.5 text-textSecondary" />
                </div>
              </div>
              
              <button
                onClick={runSearch}
                className="w-full py-1.5 text-[11px] font-bold text-white bg-primaryAccent hover:bg-blue-600 rounded transition-colors shadow shadow-blue-500/10"
              >
                Scan Pattern
              </button>
            </div>
          </div>
        </div>

        {/* Animation Comparison Display area */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Pattern Slide Overlay</h4>
          {renderTextWindow()}
        </div>

        {/* Boyer-Moore / Horspool processing tables */}
        {selectedAlgo !== 'naive' && (
          <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ListFilter size={12} className="text-textSecondary" />
              {selectedAlgo === 'bm' ? 'Boyer-Moore Pre-Processing Tables' : "Horspool's Shift Table"}
            </h4>

            {selectedAlgo === 'bm' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bad Character Table */}
                <div className="bg-[#0c1020] p-3 rounded border border-[#ffffff05]">
                  <span className="text-[8px] font-mono text-textSecondary uppercase block mb-1.5">Bad Character Heuristic (Index map)</span>
                  <div className="flex gap-2 overflow-x-auto text-[10px] font-mono text-white max-h-16 py-1 select-text">
                    {Object.entries(badCharTable).map(([char, idx]) => (
                      <div key={char} className="flex flex-col items-center border border-[#ffffff0a] px-2 py-1 rounded bg-[#080c12]">
                        <span className="text-amber-400 font-bold">'{char}'</span>
                        <span className="text-textSecondary">{idx}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Good Suffix Table */}
                <div className="bg-[#0c1020] p-3 rounded border border-[#ffffff05]">
                  <span className="text-[8px] font-mono text-textSecondary uppercase block mb-1.5">Good Suffix Heuristic (Shift offset)</span>
                  <div className="flex gap-2 overflow-x-auto text-[10px] font-mono text-white max-h-16 py-1 select-text">
                    {goodSuffixTable.map(item => (
                      <div key={item.index} className="flex flex-col items-center border border-[#ffffff0a] px-2 py-1 rounded bg-[#080c12]">
                        <span className="text-purple-400 font-bold">idx {item.index}</span>
                        <span className="text-textSecondary">+{item.shift}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Horspool shift table display
              <div className="bg-[#0c1020] p-3 rounded border border-[#ffffff05] select-text">
                <span className="text-[8px] font-mono text-textSecondary uppercase block mb-1.5">Shift table distance</span>
                <div className="flex gap-2 overflow-x-auto text-[10px] font-mono text-white py-1">
                  {Object.entries(shiftTable).map(([char, dist]) => (
                    <div key={char} className="flex flex-col items-center border border-[#ffffff0a] px-2 py-1 rounded bg-[#080c12]">
                      <span className="text-amber-400 font-bold">'{char}'</span>
                      <span className="text-textSecondary">+{dist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Presorting Demo at Bottom */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ffffff0a] pb-2">
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
                Keyword Presorting vs Linear Scanning (20 Municipal Terms)
              </h4>
              <p className="text-[10px] text-textSecondary">
                Compares querying 20 keywords from the report. Sorting enables log-time binary search.
              </p>
            </div>
            <button
              onClick={startPresortDemo}
              disabled={presortRunning}
              className="px-3 py-1 text-[10px] font-bold text-white bg-primaryAccent hover:bg-blue-600 rounded disabled:opacity-30"
            >
              {presortRunning ? 'Running...' : 'Run Query Bench'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual statistics */}
            <div className="space-y-3 select-text">
              <div className="flex items-center justify-between text-[10px] font-mono text-textSecondary">
                <span>Completed terms:</span>
                <span className="text-white font-bold">{queryProgress} / 20</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-rose-400">
                  <span>Linear Search comparisons:</span>
                  <span>{linearComparisons}</span>
                </div>
                <div className="w-full bg-[#0c1020] h-2 rounded border border-[#ffffff05] overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-150"
                    style={{ width: `${Math.min(100, (linearComparisons / 200) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-emerald-400">
                  <span>Presorted Binary Search comparisons:</span>
                  <span>{binaryComparisons}</span>
                </div>
                <div className="w-full bg-[#0c1020] h-2 rounded border border-[#ffffff05] overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, (binaryComparisons / 200) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-[#0c1020] border border-[#ffffff05] p-3 rounded text-[10px] text-textSecondary leading-relaxed select-text">
              <span className="text-white font-bold block mb-1">Pre-processing Advantage:</span>
              Without presorting, each query scans term-by-term (average `O(N/2)` cost). By sorting the query table once in `O(N log N)`, subsequent searches resolve in `O(log N)` using split halves, yielding over <strong className="text-emerald-400">55% reduction</strong> in memory checks for 20 elements.
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Stats, Controls, Console (1/3 width) */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Statistics panel */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Search stats</h4>
          
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Char Checks</span>
              <span className="text-sm font-bold text-amber-400">{totalComparisons}</span>
            </div>
            
            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Chars Skipped</span>
              <span className="text-sm font-bold text-rose-400">{totalSkips}</span>
            </div>

            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Matches</span>
              <span className="text-sm font-bold text-emerald-400">{matchesFound}</span>
            </div>

            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Sim Time</span>
              <span className="text-sm font-bold text-white">{(totalComparisons * 0.12).toFixed(1)} µs</span>
            </div>
          </div>
        </div>

        {/* StepControls */}
        <div className="shrink-0">
          <StepControls {...algoEngine} />
        </div>

        {/* Console Log */}
        <div className="flex-1 min-h-[200px]">
          <AlgoEngineLog
            algoName={selectedAlgo === 'bm' ? "Boyer-Moore Substring Matcher" : selectedAlgo === 'horspool' ? "Horspool's Matcher" : "Naive Scanner"}
            timeComplexity={selectedAlgo === 'bm' ? "O(N/M) avg / O(N*M) worst" : selectedAlgo === 'horspool' ? "O(N/M) avg" : "O(N*M)"}
            spaceComplexity={selectedAlgo === 'bm' ? "O(M + Σ)" : selectedAlgo === 'horspool' ? "O(Σ)" : "O(1)"}
            steps={algoEngine.steps}
            currentStep={algoEngine.currentStep}
            executionTime={`${(totalComparisons * 0.12).toFixed(1)} µs`}
          />
        </div>
      </div>
    </div>
  );
}
