// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, Clock, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import KPICard from '../components/KPICard';
import NetworkGraph from '../components/NetworkGraph';
import { dijkstra } from '../algorithms/graph';

// 8 Bengaluru localities nodes
const DASHBOARD_NODES = [
  { id: 'HEB', label: 'Hebbal', x: 300, y: 50 },
  { id: 'IND', label: 'Indiranagar', x: 380, y: 150 },
  { id: 'KOR', label: 'Koramangala', x: 320, y: 230 },
  { id: 'HSR', label: 'HSR Layout', x: 360, y: 310 },
  { id: 'ECI', label: 'Electronic City', x: 420, y: 370 },
  { id: 'JAY', label: 'Jayanagar', x: 180, y: 250 },
  { id: 'BTM', label: 'BTM Layout', x: 260, y: 330 },
  { id: 'WHI', label: 'Whitefield', x: 500, y: 130 }
];

// Edges with distance weights (in km)
const DASHBOARD_EDGES = [
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
];

const MODULES_PREVIEW = [
  {
    id: 'route-optimizer',
    name: 'Route Optimizer',
    color: 'border-l-[#8b5cf6] hover:bg-[#8b5cf6]/5',
    accent: '#8b5cf6',
    desc: 'Solve multi-stop routing schedules across Bangalore points.',
    algo: 'Dijkstra / Floyd-Warshall'
  },
  {
    id: 'fleet-sorter',
    name: 'Fleet Sorter',
    color: 'border-l-[#10b981] hover:bg-[#10b981]/5',
    accent: '#10b981',
    desc: 'Organize delivery vehicles dynamically by composite urgency.',
    algo: 'Merge / Quick / Insertion Sort'
  },
  {
    id: 'network-mapper',
    name: 'Network Mapper',
    color: 'border-l-[#f59e0b] hover:bg-[#f59e0b]/5',
    accent: '#f59e0b',
    desc: 'Map road overlays, check grid reachability, and trace traversals.',
    algo: 'DFS / BFS / Topological Sort'
  },
  {
    id: 'budget-allocator',
    name: 'Budget Allocator',
    color: 'border-l-[#ef4444] hover:bg-[#ef4444]/5',
    accent: '#ef4444',
    desc: 'Distribute infrastructure budgets using dynamic packing tables.',
    algo: '0/1 & Fractional Knapsack'
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    color: 'border-l-[#06b6d4] hover:bg-[#06b6d4]/5',
    accent: '#06b6d4',
    desc: 'Coordinate events, balance shift loads, and solve routing tours.',
    algo: 'N-Queens / TSP / Subset Sum'
  },
  {
    id: 'document-search',
    name: 'Document Search',
    color: 'border-l-[#ec4899] hover:bg-[#ec4899]/5',
    accent: '#ec4899',
    desc: 'Scan civic records instantly using advanced slide search rules.',
    algo: 'Boyer-Moore / Horspool / Naive'
  }
];

const FAKE_EVENT_TEMPLATES = [
  "Merge Sort organized 30 delivery vehicles by urgency in 1.4 ms",
  "Dijkstra routed HEB → ECI: Shortest path found (26.0 km)",
  "Knapsack solver optimized ₹85L budget for 6 BBMP projects",
  "Boyer-Moore completed substring scan of 842 characters in 0.8 µs",
  "Branch & Bound TSP solved 6-station patrol cycle: 42.6 km total cost",
  "Prim's MST built minimum-cost electric grid connecting 8 sectors (cost: 34 ₹L)",
  "Topological Sort calculated 6 metro phases scheduled in order",
  "Subset Sum matched grant total ₹47L with exactly 3 combined project bills",
  "Max-Heap queue ingested Pothole repair ticket (Critical Priority P0)",
  "Heapsort ordered all current maintenance logs in 2.2 ms"
];

export default function Dashboard({ setCurrentPage }) {
  const [source, setSource] = useState(null);
  const [target, setTarget] = useState(null);
  const [shortestPath, setShortestPath] = useState([]);
  const [distance, setDistance] = useState(null);
  
  const [events, setEvents] = useState([
    "System initialized. Core algorithms pre-compiled.",
    "Network graph loaded (8 nodes, 11 weighted edges).",
    "Max-heap active: ticketing system queue running."
  ]);

  // Handle source/target selection for dijkstra pathfinding
  const handleNodeClick = (nodeId) => {
    if (!source || (source && target)) {
      setSource(nodeId);
      setTarget(null);
      setShortestPath([]);
      setDistance(null);
    } else if (source && !target) {
      if (nodeId === source) {
        // Deselect
        setSource(null);
        return;
      }
      setTarget(nodeId);

      // Run real Dijkstra
      const nodeIds = DASHBOARD_NODES.map(n => n.id);
      const steps = dijkstra(nodeIds, DASHBOARD_EDGES, source, nodeId);
      const finalStep = steps[steps.length - 1];
      
      if (finalStep && finalStep.path.length > 0) {
        setShortestPath(finalStep.path);
        setDistance(finalStep.distances[nodeId]);
        
        // Add event
        const pathStr = finalStep.path.join(' → ');
        addEvent(`Dijkstra found shortest path ${pathStr}: ${finalStep.distances[nodeId]} km`);
      } else {
        setShortestPath([]);
        setDistance(null);
        addEvent(`Dijkstra failed: ${source} and ${nodeId} are disconnected.`);
      }
    }
  };

  const addEvent = (msg) => {
    setEvents(prev => [msg, ...prev.slice(0, 14)]);
  };

  // Activity feed simulator: add event every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * FAKE_EVENT_TEMPLATES.length);
      const randomEvent = FAKE_EVENT_TEMPLATES[idx];
      // Inject some dynamics
      addEvent(randomEvent);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Active Routes"
          value="147"
          delta="12%"
          deltaType="up"
          icon={MapPin}
          color="purple"
        />
        <KPICard
          label="Avg Cost Reduction"
          value="23.4%"
          delta="4.2%"
          deltaType="up"
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          label="Budget Utilized"
          value="68.2%"
          delta="1.8%"
          deltaType="down"
          icon={DollarSign}
          color="amber"
        />
        <KPICard
          label="Pending Tasks"
          value="31"
          delta="8%"
          deltaType="down"
          icon={Clock}
          color="red"
        />
      </div>

      {/* Main Grid: D3 Map + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualizer (2/3 width) */}
        <div className="lg:col-span-2 bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide">Interactive Bangalore Grid</h3>
              <p className="text-[10px] text-textSecondary">
                Select two nodes to calculate the shortest path dynamically using Dijkstra's algorithm.
              </p>
            </div>
            {source && (
              <div className="text-[10px] font-mono bg-darkBg border border-borderColor px-2.5 py-1 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-textSecondary">Route:</span>
                <span className="text-white font-bold">{source}</span>
                {target && (
                  <>
                    <span className="text-textSecondary">→</span>
                    <span className="text-white font-bold">{target}</span>
                    <span className="text-textSecondary">({distance} km)</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-h-0 relative">
            <NetworkGraph
              nodes={DASHBOARD_NODES}
              edges={DASHBOARD_EDGES}
              highlightPath={shortestPath}
              selectedNodes={[source, target].filter(Boolean)}
              onNodeClick={handleNodeClick}
              width={600}
              height={300}
            />
            {(!source) && (
              <div className="absolute bottom-2.5 left-2.5 bg-[#0f1628]/95 border border-[#ffffff0a] px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[9px] text-textSecondary pointer-events-none">
                <AlertCircle size={10} className="text-cyan-400 shrink-0" />
                <span>Click a node to set path start-point</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Console Feed (1/3 width) */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[400px] overflow-hidden">
          <div className="pb-2 mb-3 border-b border-[#ffffff0a] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" />
              <h3 className="text-xs font-semibold text-white tracking-wide">Live Operations Feed</h3>
            </div>
            <span className="text-[9px] font-mono text-textMuted uppercase tracking-wider">3s poll</span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-3 pr-1 scrollbar-thin scroll-smooth min-h-0">
            {events.map((evt, idx) => (
              <div key={idx} className="flex gap-2 items-start text-[#94a3b8] leading-tight border-b border-[#ffffff04] pb-2 last:border-b-0">
                <span className="text-textMuted font-bold shrink-0">{idx === 0 ? '▶' : '•'}</span>
                <p>{evt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules list previews */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-white tracking-wider uppercase">Operational Module Portals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODULES_PREVIEW.map(mod => (
            <div
              key={mod.id}
              className={`bg-cardBg border border-borderColor border-l-[3.5px] ${mod.color} rounded-lg p-4 flex flex-col justify-between h-40 transition-all duration-150 group`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white group-hover:text-textPrimary transition-colors">
                    {mod.name}
                  </h4>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-textSecondary uppercase">
                    {mod.algo.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[10px] text-textSecondary leading-normal">
                  {mod.desc}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#ffffff05] pt-3 mt-3">
                <span className="text-[9px] font-mono text-textMuted tracking-tight">
                  Engine: {mod.algo}
                </span>
                <button
                  onClick={() => setCurrentPage(mod.id)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-primaryAccent hover:underline group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Open</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
