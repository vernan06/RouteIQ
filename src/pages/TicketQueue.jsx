// src/pages/TicketQueue.jsx
import React, { useState, useEffect, useRef } from 'react';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { AlertCircle, Plus, Bell, RefreshCw, CheckSquare } from 'lucide-react';

const CATEGORIES = ['Pothole', 'Power', 'Water', 'Traffic', 'Sewage'];

const INITIAL_HEAP = [
  { id: 'TKT-1001', category: 'Sewage', priority: 95, label: 'SEW-95', ts: '10:15' },
  { id: 'TKT-1002', category: 'Pothole', priority: 80, label: 'POT-80', ts: '10:17' },
  { id: 'TKT-1003', category: 'Water', priority: 65, label: 'WAT-65', ts: '10:18' },
  { id: 'TKT-1004', category: 'Power', priority: 45, label: 'POW-45', ts: '10:19' },
  { id: 'TKT-1005', category: 'Traffic', priority: 55, label: 'TRA-55', ts: '10:20' },
  { id: 'TKT-1006', category: 'Pothole', priority: 30, label: 'POT-30', ts: '10:21' }
];

export default function TicketQueue() {
  const [heap, setHeap] = useState(INITIAL_HEAP);
  const [served, setServed] = useState([
    { id: 'TKT-0998', category: 'Water', priority: 98, ts: '09:50', servedAt: '09:55' },
    { id: 'TKT-0999', category: 'Power', priority: 92, ts: '10:02', servedAt: '10:05' }
  ]);
  const [autoArrive, setAutoArrive] = useState(true);
  const [ticketCounter, setTicketCounter] = useState(1007);
  const [totalOperations, setTotalOperations] = useState(6);

  // Setup AlgoEngine
  const algoEngine = useAlgoEngine([], 3);

  // Layout coordinates for 15 nodes complete binary tree (index 0 to 14)
  const getCoordinates = (idx) => {
    // Width = 500, Height = 250
    // Level 0: root
    if (idx === 0) return { x: 250, y: 35 };
    // Level 1
    if (idx === 1) return { x: 140, y: 90 };
    if (idx === 2) return { x: 360, y: 90 };
    // Level 2
    if (idx === 3) return { x: 80, y: 145 };
    if (idx === 4) return { x: 200, y: 145 };
    if (idx === 5) return { x: 300, y: 145 };
    if (idx === 6) return { x: 420, y: 145 };
    // Level 3
    if (idx === 7) return { x: 50, y: 200 };
    if (idx === 8) return { x: 110, y: 200 };
    if (idx === 9) return { x: 170, y: 200 };
    if (idx === 10) return { x: 230, y: 200 };
    if (idx === 11) return { x: 270, y: 200 };
    if (idx === 12) return { x: 330, y: 200 };
    if (idx === 13) return { x: 390, y: 200 };
    if (idx === 14) return { x: 450, y: 200 };
    return { x: 250, y: 220 };
  };

  // Node priority color mapper
  const getNodeColor = (priority) => {
    if (priority >= 80) return { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444' }; // P0 Red
    if (priority >= 55) return { fill: 'rgba(245, 158, 11, 0.25)', stroke: '#f59e0b' }; // P1 Amber
    return { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981' }; // P2 Green
  };

  // 1. Heap Insertion animation steps
  const insertTicket = (newTicket) => {
    const steps = [];
    const arr = [...heap, newTicket];
    let currIdx = arr.length - 1;

    steps.push({
      array: [...arr],
      highlightIdx: [currIdx],
      description: `New ticket ${newTicket.id} (${newTicket.category}, Priority: ${newTicket.priority}) added at bottom index ${currIdx}.`
    });

    // Bubble up
    while (currIdx > 0) {
      const parentIdx = Math.floor((currIdx - 1) / 2);
      
      steps.push({
        array: [...arr],
        highlightIdx: [currIdx, parentIdx],
        description: `Compare index ${currIdx} (Priority ${arr[currIdx].priority}) with parent index ${parentIdx} (Priority ${arr[parentIdx].priority}).`
      });

      if (arr[currIdx].priority > arr[parentIdx].priority) {
        // Swap
        const temp = arr[currIdx];
        arr[currIdx] = arr[parentIdx];
        arr[parentIdx] = temp;

        currIdx = parentIdx;
        steps.push({
          array: [...arr],
          highlightIdx: [currIdx],
          swappedIdx: [currIdx, parentIdx],
          description: `Swap parent and child since child priority is higher. Current index bubbles up to ${currIdx}.`
        });
      } else {
        break;
      }
    }

    steps.push({
      array: [...arr],
      highlightIdx: [],
      description: `Heap property restored. Insertion complete.`
    });

    setHeap(arr);
    algoEngine.setSteps(steps);
    setTotalOperations(prev => prev + 1);
  };

  // 2. Serve Next (extract max) animation steps
  const serveNext = () => {
    if (heap.length === 0) return;
    const steps = [];
    const arr = [...heap];
    const maxItem = arr[0];
    const lastItem = arr.pop();

    if (arr.length > 0) {
      arr[0] = lastItem;
      steps.push({
        array: [...arr],
        highlightIdx: [0],
        description: `Serve ticket ${maxItem.id} (root). Move last element ${lastItem.id} (Priority: ${lastItem.priority}) to root.`
      });

      // Sift down
      let curr = 0;
      const n = arr.length;

      while (true) {
        let largest = curr;
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;

        if (left < n && arr[left].priority > arr[largest].priority) {
          largest = left;
        }
        if (right < n && arr[right].priority > arr[largest].priority) {
          largest = right;
        }

        if (largest !== curr) {
          steps.push({
            array: [...arr],
            highlightIdx: [curr, largest],
            description: `Compare parent index ${curr} (${arr[curr].priority}) with children. Child index ${largest} (${arr[largest].priority}) is larger.`
          });

          // Swap
          const temp = arr[curr];
          arr[curr] = arr[largest];
          arr[largest] = temp;

          curr = largest;
          steps.push({
            array: [...arr],
            highlightIdx: [curr],
            swappedIdx: [curr, largest],
            description: `Swap parent and child to sift down.`
          });
        } else {
          break;
        }
      }
    } else {
      steps.push({
        array: [],
        highlightIdx: [],
        description: `Serve root ticket. Heap is now empty.`
      });
    }

    steps.push({
      array: [...arr],
      highlightIdx: [],
      description: `Heap sift-down complete. Serve finished.`
    });

    setHeap(arr);
    algoEngine.setSteps(steps);
    
    // Add to served list
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setServed(prev => [{ ...maxItem, servedAt: now }, ...prev]);
    setTotalOperations(prev => prev + 1);
  };

  // 3. Heapsort animation steps
  const heapsortAll = () => {
    setAutoArrive(false); // Pause arrivals during sort
    const steps = [];
    const arr = [...heap];
    const n = arr.length;

    steps.push({
      array: [...arr],
      description: "Initialize Heapsort. Build max-heap (already structured)."
    });

    for (let i = n - 1; i > 0; i--) {
      steps.push({
        array: [...arr],
        highlightIdx: [0, i],
        description: `Swap root index 0 (Max Priority: ${arr[0].priority}) with last unsorted index ${i} (Priority: ${arr[i].priority}).`
      });

      // Swap
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;

      steps.push({
        array: [...arr],
        swappedIdx: [0, i],
        sortedIdx: Array.from({ length: n - i }, (_, k) => n - 1 - k),
        description: `Placed priority ${temp.priority} at sorted manifest index ${i}. Redefining heap bounds to size ${i}.`
      });

      // Sift down root into remaining heap of size i
      let curr = 0;
      const heapSize = i;

      while (true) {
        let largest = curr;
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;

        if (left < heapSize && arr[left].priority > arr[largest].priority) {
          largest = left;
        }
        if (right < heapSize && arr[right].priority > arr[largest].priority) {
          largest = right;
        }

        if (largest !== curr) {
          // Swap
          const tempVal = arr[curr];
          arr[curr] = arr[largest];
          arr[largest] = tempVal;
          
          curr = largest;
          steps.push({
            array: [...arr],
            highlightIdx: [curr],
            sortedIdx: Array.from({ length: n - i }, (_, k) => n - 1 - k),
            description: `Sifting down: swap index with larger child.`
          });
        } else {
          break;
        }
      }
    }

    steps.push({
      array: [...arr],
      sortedIdx: Array.from({ length: n }, (_, k) => k),
      description: "Heapsort complete. All elements ordered ascending."
    });

    algoEngine.setSteps(steps);
    setTotalOperations(prev => prev + 1);
  };

  // Live arrival trigger every 4 seconds
  useEffect(() => {
    if (!autoArrive) return;

    const interval = setInterval(() => {
      const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      // P0, P1, P2 priority range distribution
      const roll = Math.random();
      let priority = 35; // normal
      if (roll > 0.8) priority = 90 + Math.floor(Math.random() * 10); // critical
      else if (roll > 0.5) priority = 60 + Math.floor(Math.random() * 20); // high
      else priority = 20 + Math.floor(Math.random() * 30); // normal

      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const newTkt = {
        id: `TKT-${ticketCounter}`,
        category: randomCat,
        priority,
        label: `${randomCat.slice(0, 3).toUpperCase()}-${priority}`,
        ts: now
      };

      setTicketCounter(prev => prev + 1);
      
      // Auto trigger insert
      insertTicket(newTkt);
    }, 4000);

    return () => clearInterval(interval);
  }, [heap, autoArrive, ticketCounter]);

  // Extract variables of the current step
  const currentStepData = algoEngine.steps[algoEngine.currentStep] || {};
  const currentArray = currentStepData.array || heap;
  const currentHighlight = currentStepData.highlightIdx || [];
  const currentSwapped = currentStepData.swappedIdx || [];
  const currentSorted = currentStepData.sortedIdx || [];

  // Priority queue metrics
  const heapSize = currentArray.length;
  const avgPriority = heapSize > 0
    ? Math.round(currentArray.reduce((acc, curr) => acc + curr.priority, 0) / heapSize)
    : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT PANEL: Max-Heap Tree (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Module Header */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ticketQueue" />
              Ticket Queue
            </h3>
            <p className="text-[10px] text-textSecondary">
              Manage incoming city reports in real-time. Highest priority always served first (Max-Heap).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoArrive(prev => !prev)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1.5 ${
                autoArrive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#1e293b] text-textSecondary'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoArrive ? 'bg-emerald-400 animate-pulse' : 'bg-textSecondary'}`} />
              Auto Intake (4s)
            </button>
            
            <button
              onClick={serveNext}
              disabled={heap.length === 0}
              className="px-2.5 py-1 text-[10px] font-bold text-white bg-primaryAccent hover:bg-blue-600 rounded disabled:opacity-30 flex items-center gap-1"
            >
              <CheckSquare size={10} />
              Serve Next
            </button>

            <button
              onClick={heapsortAll}
              disabled={heap.length <= 1}
              className="px-2.5 py-1 text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-30 flex items-center gap-1"
            >
              <RefreshCw size={10} />
              Heapsort All
            </button>
          </div>
        </div>

        {/* Max Heap Tree Canvas */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[320px] relative">
          <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest mb-2 shrink-0">
            Binary Max-Heap Visualizer
          </span>

          <div className="flex-1 min-h-0">
            <svg width="100%" height="100%" viewBox="0 0 500 240" className="bg-[#0b0e1a] border border-[#ffffff04] rounded-lg">
              {/* Render parent-child link lines first */}
              <g>
                {currentArray.map((node, idx) => {
                  if (idx === 0) return null;
                  const parentIdx = Math.floor((idx - 1) / 2);
                  const parentCoords = getCoordinates(parentIdx);
                  const childCoords = getCoordinates(idx);

                  const isEdgeHighlight = currentHighlight.includes(idx) && currentHighlight.includes(parentIdx);
                  return (
                    <line
                      key={`link-${idx}`}
                      x1={parentCoords.x}
                      y1={parentCoords.y}
                      x2={childCoords.x}
                      y2={childCoords.y}
                      stroke={isEdgeHighlight ? '#f59e0b' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={isEdgeHighlight ? 2 : 1}
                    />
                  );
                })}
              </g>

              {/* Render Node Circles */}
              <g>
                {currentArray.map((node, idx) => {
                  const coord = getCoordinates(idx);
                  const style = getNodeColor(node.priority);
                  const isHighlight = currentHighlight.includes(idx);
                  const isSwapped = currentSwapped.includes(idx);
                  const isSorted = currentSorted.includes(idx);

                  let stroke = style.stroke;
                  let fill = style.fill;
                  let strokeWidth = 1.5;

                  if (isSwapped) {
                    stroke = '#ef4444'; // red flash
                    fill = 'rgba(239, 68, 68, 0.4)';
                    strokeWidth = 2.5;
                  } else if (isHighlight) {
                    stroke = '#fbbf24'; // yellow glow
                    fill = 'rgba(251, 191, 36, 0.4)';
                    strokeWidth = 2.5;
                  } else if (isSorted) {
                    stroke = '#06b6d4'; // cyan sorted
                    fill = 'rgba(6, 182, 212, 0.1)';
                  }

                  return (
                    <g key={node.id} transform={`translate(${coord.x}, ${coord.y})`} className="group select-none">
                      <circle
                        r="14"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        className="transition-all duration-150"
                      />
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="text-[9px] font-mono font-bold fill-white pointer-events-none"
                        y="1"
                      >
                        {node.priority}
                      </text>
                      <text
                        textAnchor="middle"
                        className="text-[7px] fill-textSecondary font-semibold pointer-events-none"
                        y="-18"
                      >
                        {node.category.slice(0, 3)}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Step Controls */}
        <StepControls {...algoEngine} />
      </div>

      {/* RIGHT PANEL: Live ticket feed, Served history, stats & Console (1/3 width) */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Statistics panel */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Queue Metrics</h4>
          
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Heap Size</span>
              <span className="text-sm font-bold text-blue-400">{heapSize}</span>
            </div>
            
            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Avg Priority</span>
              <span className="text-sm font-bold text-amber-500">{avgPriority}</span>
            </div>

            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Served Count</span>
              <span className="text-sm font-bold text-emerald-400">{served.length}</span>
            </div>

            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Total Ops</span>
              <span className="text-sm font-bold text-white">{totalOperations}</span>
            </div>
          </div>
        </div>

        {/* Live feed & Served history tabs */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-64 overflow-hidden shrink-0">
          <div className="flex justify-between items-center border-b border-[#ffffff0a] pb-2 mb-3">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={12} className="text-textSecondary" />
              Real-time Ingestion Feed
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin select-text">
            {heap.map(tkt => (
              <div key={tkt.id} className="bg-[#0c1020] border border-[#ffffff06] px-2.5 py-1.5 rounded flex items-center justify-between text-[9px] font-mono text-textSecondary">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    tkt.priority >= 80 ? 'bg-rose-500' : tkt.priority >= 55 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-white font-bold">{tkt.id}</span>
                  <span>{tkt.category}</span>
                </div>
                <div className="flex gap-3">
                  <span>Priority: <strong className="text-white">{tkt.priority}</strong></span>
                  <span>{tkt.ts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Served log history */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-56 overflow-hidden shrink-0">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-[#ffffff0a] pb-2 mb-3">
            Served Ticket History
          </h4>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin select-text">
            {served.map(tkt => (
              <div key={tkt.id} className="bg-[#0c1020] border border-[#ffffff06] px-2.5 py-1.5 rounded flex items-center justify-between text-[9px] font-mono text-textSecondary">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span className="text-white font-bold">{tkt.id}</span>
                  <span>{tkt.category}</span>
                </div>
                <div className="flex gap-3">
                  <span>Priority: {tkt.priority}</span>
                  <span>Done: {tkt.servedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Console Log */}
        <div className="flex-1 min-h-[160px]">
          <AlgoEngineLog
            algoName="Max-Heap Priority Queue"
            timeComplexity="O(log N) insert/delete"
            spaceComplexity="O(N)"
            steps={algoEngine.steps}
            currentStep={algoEngine.currentStep}
            executionTime="0.08 ms"
          />
        </div>
      </div>
    </div>
  );
}
