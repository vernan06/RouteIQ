// src/pages/RouteOptimizer.jsx
import React, { useState, useEffect } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { dijkstra, floydWarshall, warshall } from '../algorithms/graph';
import { Route, HelpCircle, Layers, Grid } from 'lucide-react';

const LOCALITIES = [
  { id: 'YEL', label: 'Yelahanka', x: 300, y: 30 },
  { id: 'HEB', label: 'Hebbal', x: 280, y: 100 },
  { id: 'IND', label: 'Indiranagar', x: 380, y: 150 },
  { id: 'MAR', label: 'Marathahalli', x: 480, y: 190 },
  { id: 'WHI', label: 'Whitefield', x: 530, y: 110 },
  { id: 'KOR', label: 'Koramangala', x: 310, y: 220 },
  { id: 'HSR', label: 'HSR Layout', x: 340, y: 300 },
  { id: 'ECI', label: 'Electronic City', x: 420, y: 360 },
  { id: 'BTM', label: 'BTM Layout', x: 230, y: 310 },
  { id: 'JAY', label: 'Jayanagar', x: 130, y: 250 }
];

const EDGES = [
  { source: 'YEL', target: 'HEB', weight: 12 },
  { source: 'HEB', target: 'IND', weight: 9 },
  { source: 'HEB', target: 'JAY', weight: 14 },
  { source: 'IND', target: 'MAR', weight: 8 },
  { source: 'IND', target: 'KOR', weight: 5 },
  { source: 'MAR', target: 'WHI', weight: 6 },
  { source: 'MAR', target: 'HSR', weight: 9 },
  { source: 'WHI', target: 'ECI', weight: 22 },
  { source: 'KOR', target: 'HSR', weight: 6 },
  { source: 'KOR', target: 'BTM', weight: 4 },
  { source: 'KOR', target: 'JAY', weight: 5 },
  { source: 'HSR', target: 'ECI', weight: 11 },
  { source: 'HSR', target: 'BTM', weight: 3 },
  { source: 'BTM', target: 'JAY', weight: 4 }
];

export default function RouteOptimizer() {
  const [source, setSource] = useState('HEB');
  const [target, setTarget] = useState('ECI');
  const [mode, setMode] = useState('dijkstra'); // dijkstra | floyd
  const [showReachability, setShowReachability] = useState(false); // Warshall toggle
  
  // Matrix cache (pre-calculate on load)
  const [fwMatrix, setFwMatrix] = useState([]);
  const [wMatrix, setWMatrix] = useState([]);

  // Setup AlgoEngine
  const algoEngine = useAlgoEngine([], 1.5);

  const runDijkstra = () => {
    if (!source || !target) return;
    const nodeIds = LOCALITIES.map(n => n.id);
    const steps = dijkstra(nodeIds, EDGES, source, target);
    algoEngine.setSteps(steps);
  };

  // Pre-calculate Floyd-Warshall and Warshall on component mount
  useEffect(() => {
    const nodeIds = LOCALITIES.map(n => n.id);
    // Floyd Warshall final matrix
    const fwSteps = floydWarshall(nodeIds, EDGES);
    const finalFw = fwSteps[fwSteps.length - 1]?.matrix || [];
    setFwMatrix(finalFw);

    // Warshall final matrix
    const wSteps = warshall(nodeIds, EDGES);
    const finalW = wSteps[wSteps.length - 1]?.matrix || [];
    setWMatrix(finalW);

    // Initial run of Dijkstra
    runDijkstra();
  }, []);

  // Run Dijkstra when source/target changes
  useEffect(() => {
    runDijkstra();
  }, [source, target]);

  const currentStepData = algoEngine.steps[algoEngine.currentStep] || {};
  const currentPath = currentStepData.path || [];
  const currentVisited = currentStepData.visited || [];
  const currentDistances = currentStepData.distances || {};
  const currentHighlight = currentStepData.current || null;
  const currentComparingEdge = currentStepData.comparingEdge || null;

  // Calculate final path metrics if complete
  const finalDistance = currentDistances[target] !== Infinity ? currentDistances[target] : null;
  const estTimeHours = finalDistance ? finalDistance / 40 : null; // 40 km/h avg speed
  const estTimeMin = estTimeHours ? Math.round(estTimeHours * 60) : null;

  const handleNodeClick = (nodeId) => {
    // Interactive graph click updates selectors
    if (nodeId === source) return;
    setTarget(nodeId);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT & CENTER PANEL: Graph + Matrix Tables (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Module Header */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-routeOpt" />
              Route Optimizer
            </h3>
            <p className="text-[10px] text-textSecondary">
              Solve pathfinding and distance matrices using Dijkstra and Floyd-Warshall.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode('dijkstra'); }}
              className={`px-3 py-1 text-[10px] font-medium rounded transition-colors ${
                mode === 'dijkstra'
                  ? 'bg-primaryAccent text-white'
                  : 'bg-[#1e293b] text-textSecondary hover:text-white'
              }`}
            >
              Dijkstra (Single-Source)
            </button>
            <button
              onClick={() => { setMode('floyd'); }}
              className={`px-3 py-1 text-[10px] font-medium rounded transition-colors ${
                mode === 'floyd'
                  ? 'bg-primaryAccent text-white'
                  : 'bg-[#1e293b] text-textSecondary hover:text-white'
              }`}
            >
              Floyd-Warshall (All Pairs)
            </button>
          </div>
        </div>

        {/* Graph Display Area */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
              Bangalore Logistics Grid (10 Localities)
            </span>
            <div className="flex items-center gap-4 text-[9px] font-mono text-textSecondary">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span>Visited</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span>Path Target</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <NetworkGraph
              nodes={LOCALITIES}
              edges={EDGES}
              highlightPath={mode === 'dijkstra' ? currentPath : []}
              visitedNodes={mode === 'dijkstra' ? currentVisited : []}
              selectedNodes={[source, target]}
              currentNode={mode === 'dijkstra' ? currentHighlight : null}
              comparingEdge={mode === 'dijkstra' ? currentComparingEdge : null}
              onNodeClick={handleNodeClick}
              width={650}
              height={290}
            />
          </div>
        </div>

        {/* Dynamic Matrix (Floyd-Warshall / Warshall result) */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4">
          <div className="flex items-center justify-between mb-4 border-b border-[#ffffff0a] pb-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={12} className="text-textSecondary" />
              {showReachability ? "Reachability Matrix (Warshall's)" : "All-Pairs Distance Matrix (Floyd-Warshall)"}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-textSecondary font-mono">Reachability Matrix:</span>
              <button
                onClick={() => setShowReachability(prev => !prev)}
                className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  showReachability ? 'bg-primaryAccent' : 'bg-[#1e293b]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${
                    showReachability ? 'transform translate-x-4' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[9px] text-textSecondary border-collapse">
              <thead>
                <tr className="border-b border-[#ffffff08] bg-[#0c1020]">
                  <th className="p-1.5 text-left font-bold text-white font-mono">FROM \ TO</th>
                  {LOCALITIES.map(n => (
                    <th key={n.id} className="p-1.5 text-center font-bold text-textPrimary font-mono w-10">
                      {n.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LOCALITIES.map((fromNode, rIdx) => (
                  <tr key={fromNode.id} className="border-b border-[#ffffff04] hover:bg-[#ffffff02]">
                    <td className="p-1.5 text-left font-bold text-textPrimary font-mono">
                      {fromNode.id}
                    </td>
                    {LOCALITIES.map((toNode, cIdx) => {
                      if (showReachability) {
                        const reachable = wMatrix[rIdx]?.[cIdx];
                        return (
                          <td
                            key={toNode.id}
                            className={`p-1.5 text-center font-mono font-semibold ${
                              reachable ? 'text-emerald-400 bg-emerald-500/5' : 'text-textMuted'
                            }`}
                          >
                            {reachable ? 'T' : 'F'}
                          </td>
                        );
                      } else {
                        const val = fwMatrix[rIdx]?.[cIdx];
                        const isInf = val === Infinity || val === undefined;
                        return (
                          <td
                            key={toNode.id}
                            className={`p-1.5 text-center font-mono ${
                              rIdx === cIdx ? 'text-textMuted' : isInf ? 'text-[#e11d48]' : 'text-textSecondary'
                            }`}
                          >
                            {isInf ? '∞' : val}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Controls, Console & Results (1/3 width) */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Route Selectors & Results */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-4 shrink-0">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Path Planner</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] text-textSecondary uppercase font-mono block">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#0c1020] border border-[#ffffff12] rounded p-1.5 text-xs text-white focus:outline-none focus:border-primaryAccent"
              >
                {LOCALITIES.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.id})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] text-textSecondary uppercase font-mono block">Destination</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-[#0c1020] border border-[#ffffff12] rounded p-1.5 text-xs text-white focus:outline-none focus:border-primaryAccent"
              >
                {LOCALITIES.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shortest Path Results Card */}
          {mode === 'dijkstra' && (
            <div className="bg-[#111827] border border-[#ffffff0a] rounded p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Shortest Path</span>
                <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase">
                  Dijkstra
                </span>
              </div>

              {finalDistance ? (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-white bg-[#080c18] p-2 rounded border border-[#ffffff05]">
                    {currentPath.map((node, idx) => (
                      <React.Fragment key={node}>
                        {idx > 0 && <span className="text-textSecondary">→</span>}
                        <span className="font-bold text-cyan-400">{node}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[#080c18] p-2 rounded border border-[#ffffff05]">
                      <span className="text-[8px] text-textSecondary uppercase font-mono block">Distance</span>
                      <span className="text-sm font-bold text-emerald-400">{finalDistance} km</span>
                    </div>
                    <div className="bg-[#080c18] p-2 rounded border border-[#ffffff05]">
                      <span className="text-[8px] text-textSecondary uppercase font-mono block">Est. Time</span>
                      <span className="text-sm font-bold text-white">{estTimeMin} mins</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-rose-400 italic text-center py-2">
                  No path found (nodes disconnected).
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step controls */}
        {mode === 'dijkstra' && (
          <div className="shrink-0">
            <StepControls {...algoEngine} />
          </div>
        )}

        {/* Console Log */}
        <div className="flex-1 min-h-[200px]">
          <AlgoEngineLog
            algoName={mode === 'dijkstra' ? "Dijkstra's Shortest Path" : "Floyd-Warshall All-Pairs"}
            timeComplexity={mode === 'dijkstra' ? "O((V + E) log V)" : "O(V³)"}
            spaceComplexity={mode === 'dijkstra' ? "O(V + E)" : "O(V²)"}
            steps={mode === 'dijkstra' ? algoEngine.steps : []}
            currentStep={mode === 'dijkstra' ? algoEngine.currentStep : 0}
            executionTime={mode === 'dijkstra' ? "0.14 ms" : "1.85 ms"}
          />
        </div>
      </div>
    </div>
  );
}
