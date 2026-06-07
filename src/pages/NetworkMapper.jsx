// src/pages/NetworkMapper.jsx
import React, { useState, useEffect } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { floydWarshall, warshall, dfs, bfs, topologicalSort } from '../algorithms/graph';
import { Map, Share2, Compass, GitMerge, AlertCircle } from 'lucide-react';

const INITIAL_NODES = [
  { id: 'HEB', label: 'Hebbal', x: 260, y: 50 },
  { id: 'IND', label: 'Indiranagar', x: 380, y: 120 },
  { id: 'KOR', label: 'Koramangala', x: 300, y: 220 },
  { id: 'HSR', label: 'HSR Layout', x: 380, y: 280 },
  { id: 'ECI', label: 'Electronic City', x: 440, y: 350 },
  { id: 'JAY', label: 'Jayanagar', x: 140, y: 220 },
  { id: 'BTM', label: 'BTM Layout', x: 220, y: 320 },
  { id: 'WHI', label: 'Whitefield', x: 500, y: 150 }
];

const METRO_NODES = [
  { id: 'P1A', label: 'Feasibility Study' },
  { id: 'P1B', label: 'Land Acquisition' },
  { id: 'P2A', label: 'Utility Shifting' },
  { id: 'P2B', label: 'Civil Works' },
  { id: 'P3A', label: 'Track Laying' },
  { id: 'P3B', label: 'System Testing' }
];

const METRO_EDGES = [
  { source: 'P1A', target: 'P1B' },
  { source: 'P1B', target: 'P2A' },
  { source: 'P1B', target: 'P2B' },
  { source: 'P2A', target: 'P3A' },
  { source: 'P2B', target: 'P3A' },
  { source: 'P3A', target: 'P3B' }
];

export default function NetworkMapper() {
  const [activeTab, setActiveTab] = useState('paths'); // paths | connectivity | traversal
  const [nodes, setNodes] = useState(INITIAL_NODES);
  
  // Interactive edge list with weight setting support
  const [edges, setEdges] = useState([
    { source: 'HEB', target: 'IND', weight: 9 },
    { source: 'HEB', target: 'JAY', weight: 12 },
    { source: 'IND', target: 'KOR', weight: 5 },
    { source: 'IND', target: 'WHI', weight: 14 },
    { source: 'KOR', target: 'HSR', weight: 6 },
    { source: 'KOR', target: 'BTM', weight: 4 },
    { source: 'KOR', target: 'JAY', weight: 5 },
    { source: 'HSR', target: 'ECI', weight: 11 },
    { source: 'HSR', target: 'BTM', weight: 3 },
    { source: 'BTM', target: 'JAY', weight: 4 },
    { source: 'WHI', target: 'ECI', weight: 22 }
  ]);

  // Algo engines for different tabs
  const fwEngine = useAlgoEngine([], 2);
  const wEngine = useAlgoEngine([], 2);
  const traversalEngine = useAlgoEngine([], 1.5);
  
  const [traversalType, setTraversalType] = useState('dfs'); // dfs | bfs
  const [traversalStart, setTraversalStart] = useState('HEB');
  
  // Color codes for connected components
  const [componentColors, setComponentColors] = useState({});

  // Cycle edge weight: 2 -> 5 -> 10 -> 25 -> Infinity (Disconnected) -> 2
  const handleEdgeClick = (sourceId, targetId) => {
    // Find edge
    setEdges(prevEdges => prevEdges.map(e => {
      if ((e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)) {
        let nextWeight = 5;
        if (e.weight === 2) nextWeight = 5;
        else if (e.weight === 5) nextWeight = 10;
        else if (e.weight === 10) nextWeight = 25;
        else if (e.weight === 25) nextWeight = Infinity;
        else if (e.weight === Infinity) nextWeight = 2;

        return { ...e, weight: nextWeight };
      }
      return e;
    }));
  };

  const runFloydWarshall = () => {
    // Remove disconnected edges (Infinity weight) for calculation
    const activeEdges = edges.filter(e => e.weight !== Infinity);
    const nodeIds = nodes.map(n => n.id);
    const steps = floydWarshall(nodeIds, activeEdges);
    fwEngine.setSteps(steps);
  };

  const runWarshall = () => {
    const activeEdges = edges.filter(e => e.weight !== Infinity);
    const nodeIds = nodes.map(n => n.id);
    const steps = warshall(nodeIds, activeEdges);
    wEngine.setSteps(steps);
  };

  const runTraversal = () => {
    const activeEdges = edges.filter(e => e.weight !== Infinity);
    const nodeIds = nodes.map(n => n.id);
    let steps = [];
    if (traversalType === 'dfs') {
      steps = dfs(nodeIds, activeEdges, traversalStart);
    } else {
      steps = bfs(nodeIds, activeEdges, traversalStart);
    }
    traversalEngine.setSteps(steps);
  };

  // Re-run current tab algorithms when edges or inputs change
  useEffect(() => {
    if (activeTab === 'paths') {
      runFloydWarshall();
    } else if (activeTab === 'connectivity') {
      runWarshall();
      calculateComponents();
    } else if (activeTab === 'traversal') {
      runTraversal();
    }
  }, [edges, activeTab, traversalType, traversalStart]);

  // Connected components calculator using simple DFS
  const calculateComponents = () => {
    const activeEdges = edges.filter(e => e.weight !== Infinity);
    const nodeIds = nodes.map(n => n.id);
    const adj = {};
    nodeIds.forEach(id => adj[id] = []);
    activeEdges.forEach(e => {
      adj[e.source].push(e.target);
      adj[e.target].push(e.source);
    });

    const visited = new Set();
    const colors = {};
    let colorId = 0;

    const colorPalettes = [
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#ec4899', // pink
      '#84cc16'  // lime
    ];

    function explore(node) {
      visited.add(node);
      colors[node] = colorPalettes[colorId % colorPalettes.length];
      adj[node].forEach(neighbor => {
        if (!visited.has(neighbor)) {
          explore(neighbor);
        }
      });
    }

    nodeIds.forEach(id => {
      if (!visited.has(id)) {
        explore(id);
        colorId++;
      }
    });

    setComponentColors(colors);
  };

  // Topological sort timeline solver
  const [topoSteps, setTopoSteps] = useState([]);
  useEffect(() => {
    const steps = topologicalSort(METRO_NODES.map(n => n.id), METRO_EDGES);
    setTopoSteps(steps);
  }, []);

  const finalTopoStep = topoSteps[topoSteps.length - 1] || {};
  const sortedMetroTimeline = finalTopoStep.sortedOrder || [];

  return (
    <div className="space-y-6">
      {/* Page Header Tab Bar */}
      <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-netMap" />
            Network Mapper
          </h3>
          <p className="text-[10px] text-textSecondary">
            Map layouts, verify connectivity, and inspect metro construction timelines.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#ffffff12] md:border-b-0">
          <button
            onClick={() => setActiveTab('paths')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'paths'
                ? 'border-primaryAccent text-white bg-primaryAccent/5'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <GitMerge size={12} />
            <span>All-Pairs Paths</span>
          </button>
          
          <button
            onClick={() => setActiveTab('connectivity')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'connectivity'
                ? 'border-primaryAccent text-white bg-primaryAccent/5'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <Share2 size={12} />
            <span>Connectivity Check</span>
          </button>

          <button
            onClick={() => setActiveTab('traversal')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'traversal'
                ? 'border-primaryAccent text-white bg-primaryAccent/5'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <Compass size={12} />
            <span>Traversal Orders</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC TAB SECTIONS */}
      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Visual Canvas (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[380px]">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
                  Floyd-Warshall Distance Grid (Click edge weight to cycle value)
                </span>
                <span className="text-[9px] text-textMuted bg-[#0c1020] px-2 py-0.5 rounded font-mono">
                  Cycle values: 2 km → 5 km → 10 km → 25 km → ∞
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <NetworkGraph
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={(nId) => {
                    // Find neighbors to cycle edge
                    const neighbors = edges.filter(e => e.source === nId || e.target === nId);
                    if (neighbors.length > 0) {
                      const first = neighbors[0];
                      handleEdgeClick(first.source, first.target);
                    }
                  }}
                  width={650}
                  height={310}
                />
              </div>
            </div>

            {/* Matrix Heatmap */}
            <div className="bg-cardBg border border-borderColor rounded-lg p-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-3">
                Floyd-Warshall Distance Heatmap
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[9px] text-textSecondary border-collapse">
                  <thead>
                    <tr className="border-b border-[#ffffff08] bg-[#0c1020]">
                      <th className="p-1.5 text-left font-bold text-white font-mono">NODE</th>
                      {nodes.map(n => (
                        <th key={n.id} className="p-1.5 text-center font-bold text-textPrimary font-mono w-10">
                          {n.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((fromNode, rIdx) => {
                      const fwStep = fwEngine.steps[fwEngine.currentStep] || {};
                      const matrix = fwStep.matrix || [];
                      const isKRow = fwStep.k === rIdx;

                      return (
                        <tr key={fromNode.id} className={`border-b border-[#ffffff04] ${isKRow ? 'bg-purple-500/5' : ''}`}>
                          <td className="p-1.5 text-left font-bold text-textPrimary font-mono">
                            {fromNode.id}
                          </td>
                          {nodes.map((toNode, cIdx) => {
                            const val = matrix[rIdx]?.[cIdx];
                            const isInf = val === Infinity || val === undefined;
                            
                            // Heatmap interpolation based on distance
                            let bgStyle = {};
                            if (!isInf && val > 0) {
                              const opacity = Math.max(0.05, 0.4 - (val / 50));
                              bgStyle = { backgroundColor: `rgba(245, 158, 11, ${opacity})` };
                            } else if (rIdx === cIdx) {
                              bgStyle = { backgroundColor: 'rgba(255,255,255,0.02)' };
                            } else if (isInf) {
                              bgStyle = { backgroundColor: 'rgba(239, 68, 68, 0.05)' };
                            }

                            const isCellTarget = fwStep.i === rIdx && fwStep.j === cIdx;
                            const isCellUpdated = isCellTarget && fwStep.updated;

                            return (
                              <td
                                key={toNode.id}
                                style={bgStyle}
                                className={`p-1.5 text-center font-mono transition-all duration-100 ${
                                  isCellTarget ? 'border border-amber-400 font-bold' : ''
                                } ${isCellUpdated ? 'text-emerald-400 font-bold scale-105' : ''}`}
                              >
                                {isInf ? '∞' : val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Controls & Console (1/3 width) */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Floyd-Warshall Stepper</h4>
              <p className="text-[10px] text-textSecondary leading-normal">
                Observe the distance relaxation cell-by-cell as the algorithm evaluates each node k as an intermediate path point.
              </p>
            </div>
            
            <div className="shrink-0">
              <StepControls {...fwEngine} />
            </div>

            <div className="flex-1 min-h-[200px]">
              <AlgoEngineLog
                algoName="Floyd-Warshall All-Pairs Paths"
                timeComplexity="O(V³)"
                spaceComplexity="O(V²)"
                steps={fwEngine.steps}
                currentStep={fwEngine.currentStep}
                executionTime="1.2 ms"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'connectivity' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Visual Canvas (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[380px]">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
                  Warshall reachability (Colored by connected component)
                </span>
                <span className="text-[9px] text-textSecondary font-mono">
                  Disconnect nodes by setting weights to Infinity to spawn components.
                </span>
              </div>
              <div className="flex-1 min-h-0 relative">
                {/* Custom component color mapping */}
                <NetworkGraph
                  nodes={nodes.map(n => ({
                    ...n,
                    label: `${n.label} (Comp ${Object.keys(componentColors).length > 0 ? 'Active' : ''})`
                  }))}
                  edges={edges}
                  onNodeClick={(nId) => {
                    const neighbors = edges.filter(e => e.source === nId || e.target === nId);
                    if (neighbors.length > 0) {
                      const first = neighbors[0];
                      handleEdgeClick(first.source, first.target);
                    }
                  }}
                  width={650}
                  height={310}
                />
                
                {/* Display connected components color guides */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-2.5 bg-[#080c18]/90 border border-[#ffffff0a] p-2 rounded">
                  {nodes.map(n => (
                    <div key={n.id} className="flex items-center gap-1 text-[8px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: componentColors[n.id] }} />
                      <span className="text-textSecondary">{n.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Boolean Matrix */}
            <div className="bg-cardBg border border-borderColor rounded-lg p-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-3">
                Reachability Matrix (Warshall's Output)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[9px] text-textSecondary border-collapse">
                  <thead>
                    <tr className="border-b border-[#ffffff08] bg-[#0c1020]">
                      <th className="p-1.5 text-left font-bold text-white font-mono">NODE</th>
                      {nodes.map(n => (
                        <th key={n.id} className="p-1.5 text-center font-bold text-textPrimary font-mono w-10">
                          {n.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((fromNode, rIdx) => {
                      const wStep = wEngine.steps[wEngine.currentStep] || {};
                      const matrix = wStep.matrix || [];
                      return (
                        <tr key={fromNode.id} className="border-b border-[#ffffff04]">
                          <td className="p-1.5 text-left font-bold text-textPrimary font-mono">
                            {fromNode.id}
                          </td>
                          {nodes.map((toNode, cIdx) => {
                            const reachable = matrix[rIdx]?.[cIdx];
                            const isCellTarget = wStep.i === rIdx && wStep.j === cIdx;
                            return (
                              <td
                                key={toNode.id}
                                className={`p-1.5 text-center font-mono font-semibold transition-all ${
                                  reachable ? 'text-emerald-400 bg-emerald-500/5' : 'text-textMuted'
                                } ${isCellTarget ? 'border border-amber-400' : ''}`}
                              >
                                {reachable ? '1' : '0'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Controls & Console (1/3 width) */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Warshall Stepper</h4>
              <p className="text-[10px] text-textSecondary leading-normal">
                Computes reachability closure: cell is set to 1 if path exists from row to col via intermediate node k.
              </p>
            </div>
            
            <div className="shrink-0">
              <StepControls {...wEngine} />
            </div>

            <div className="flex-1 min-h-[200px]">
              <AlgoEngineLog
                algoName="Warshall's Reachability Closure"
                timeComplexity="O(V³)"
                spaceComplexity="O(V²)"
                steps={wEngine.steps}
                currentStep={wEngine.currentStep}
                executionTime="0.8 ms"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'traversal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Visual Canvas (2/3 width) */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[380px]">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
                      Traversals on Bengaluru Layout
                    </span>
                    <select
                      value={traversalStart}
                      onChange={(e) => setTraversalStart(e.target.value)}
                      className="bg-[#0c1020] border border-[#ffffff12] rounded p-1 text-[10px] text-white focus:outline-none"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>Start: {n.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* DFS vs BFS toggle */}
                  <div className="flex border border-[#ffffff12] rounded overflow-hidden">
                    <button
                      onClick={() => setTraversalType('dfs')}
                      className={`px-2 py-0.5 text-[9px] font-medium font-mono uppercase ${
                        traversalType === 'dfs' ? 'bg-primaryAccent text-white' : 'text-textSecondary'
                      }`}
                    >
                      DFS (Stack)
                    </button>
                    <button
                      onClick={() => setTraversalType('bfs')}
                      className={`px-2 py-0.5 text-[9px] font-medium font-mono uppercase ${
                        traversalType === 'bfs' ? 'bg-primaryAccent text-white' : 'text-textSecondary'
                      }`}
                    >
                      BFS (Queue)
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 relative">
                  {/* Graph */}
                  {(() => {
                    const stepData = traversalEngine.steps[traversalEngine.currentStep] || {};
                    const visited = stepData.visited || [];
                    const currentHighlight = stepData.currentNode || null;
                    const edgesHighlighted = stepData.treeEdges || [];

                    return (
                      <NetworkGraph
                        nodes={nodes}
                        edges={edges}
                        highlightPath={[]} // highlighted via tree edges prop
                        visitedNodes={visited}
                        selectedNodes={[currentHighlight].filter(Boolean)}
                        currentNode={currentHighlight}
                        width={650}
                        height={310}
                      />
                    );
                  })()}

                  {/* Queue/Stack visualization overlay in D3 panel */}
                  {(() => {
                    const stepData = traversalEngine.steps[traversalEngine.currentStep] || {};
                    const structure = traversalType === 'dfs' ? (stepData.stack || []) : (stepData.queue || []);
                    
                    return (
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#080c18]/95 border border-[#ffffff0a] p-2 rounded-md flex items-center gap-3">
                        <span className="text-[9px] font-mono font-bold text-textSecondary uppercase w-14 shrink-0">
                          {traversalType === 'dfs' ? 'Stack (LIFO)' : 'Queue (FIFO)'}:
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto flex-1 font-mono text-[9px] text-white">
                          {structure.length === 0 ? (
                            <span className="text-textMuted italic">Empty</span>
                          ) : (
                            structure.map((item, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded border border-[#ffffff10] ${
                                  traversalType === 'dfs' && idx === structure.length - 1
                                    ? 'bg-purple-500/25 text-purple-300 font-bold border-purple-500/40'
                                    : traversalType === 'bfs' && idx === 0
                                    ? 'bg-cyan-500/25 text-cyan-300 font-bold border-cyan-500/40'
                                    : 'bg-[#12182b]'
                                }`}
                              >
                                {item}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Controls & Console (1/3 width) */}
            <div className="space-y-6 flex flex-col h-full">
              <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Traversal Stepper</h4>
                <p className="text-[10px] text-textSecondary leading-normal">
                  {traversalType === 'dfs'
                    ? 'Depth-First Search: Explores as deep as possible along branches, buffering backtracking points on a stack.'
                    : 'Breadth-First Search: Explores neighbors layer-by-layer, buffering upcoming expansions on a FIFO queue.'}
                </p>
              </div>
              
              <div className="shrink-0">
                <StepControls {...traversalEngine} />
              </div>

              <div className="flex-1 min-h-[160px]">
                <AlgoEngineLog
                  algoName={traversalType === 'dfs' ? "DFS Traversal" : "BFS Traversal"}
                  timeComplexity="O(V + E)"
                  spaceComplexity="O(V)"
                  steps={traversalEngine.steps}
                  currentStep={traversalEngine.currentStep}
                  executionTime="0.10 ms"
                />
              </div>
            </div>
          </div>

          {/* DAG Construction Phases (Topological Sort) */}
          <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ffffff0a] pb-2">
              <div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
                  DAG Dependency Sort (Metro construction scheduling)
                </h4>
                <p className="text-[10px] text-textSecondary">
                  Arranges construction phases respecting dependencies (Kahn's Topological Sort).
                </p>
              </div>
              <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                DAG Kahn Sort
              </span>
            </div>

            {/* Timeline */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 select-text">
              {sortedMetroTimeline.map((nodeId, idx) => {
                const nodeInfo = METRO_NODES.find(n => n.id === nodeId) || {};
                return (
                  <React.Fragment key={nodeId}>
                    {idx > 0 && (
                      <div className="hidden md:block h-0.5 w-6 bg-[#ffffff1f] relative shrink-0">
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-textMuted text-[8px] font-mono font-bold">
                          ➔
                        </span>
                      </div>
                    )}
                    <div className="bg-[#101628] border border-[#ffffff0a] p-3 rounded-lg flex items-center gap-3 w-full md:w-auto shadow-md">
                      <span className="w-5 h-5 rounded-full bg-primaryAccent flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-[10px] font-bold text-white leading-tight">
                          {nodeInfo.label}
                        </h5>
                        <span className="text-[8px] font-mono text-textSecondary">
                          Phase Code: {nodeId}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
