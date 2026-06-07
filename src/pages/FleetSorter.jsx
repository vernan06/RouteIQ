// src/pages/FleetSorter.jsx
import React, { useState, useEffect, useRef } from 'react';
import SortBars from '../components/SortBars';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort } from '../algorithms/sorting';
import * as d3 from 'd3';
import { Sliders, BarChart2, FileText, CheckCircle2 } from 'lucide-react';

const INITIAL_PRIORITIES = [
  45.5, 12.0, 85.2, 32.1, 98.4, 77.8, 24.3, 61.9, 53.6, 90.0,
  8.5, 39.2, 72.4, 83.1, 15.7, 68.3, 50.9, 95.2, 29.8, 64.1,
  42.7, 88.0, 57.3, 19.5, 74.6, 35.4, 80.8, 5.2, 92.1, 47.3
];

const VEHICLES = INITIAL_PRIORITIES.map((priority, idx) => ({
  id: `KA-01-M-${1240 + idx}`,
  route: `${['KOR', 'IND', 'HSR', 'WHI', 'HEB', 'JAY', 'BTM', 'ECI'][idx % 8]} → ${['IND', 'KOR', 'WHI', 'HSR', 'JAY', 'HEB', 'ECI', 'BTM'][(idx + 3) % 8]}`,
  priority: priority,
  deadline: `${5 + (idx % 4) * 15} mins`,
  weight: `${50 + (idx * 7) % 150} kg`
}));

const ALGO_COMPLEXITIES = {
  bubble: { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', desc: 'Repeatedly swaps adjacent elements if they are out of order.' },
  selection: { name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', desc: 'Finds the minimum element from unsorted part and puts it at the beginning.' },
  insertion: { name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', desc: 'Builds the sorted array one item at a time by sliding elements.' },
  merge: { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', desc: 'Divide-and-conquer algorithm that splits and merges sub-arrays.' },
  quick: { name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', desc: 'Pivots and partitions sub-arrays recursively around a chosen element.' }
};

// Data for the D3 comparison chart (approximate operations count for N=30)
const CHART_DATA = [
  { name: 'Bubble', ops: 650, color: '#ef4444' },
  { name: 'Selection', ops: 464, color: '#f59e0b' },
  { name: 'Insertion', ops: 434, color: '#3b82f6' },
  { name: 'Merge', ops: 300, color: '#8b5cf6' },
  { name: 'Quick', ops: 180, color: '#10b981' }
];

export default function FleetSorter() {
  const [selectedAlgo, setSelectedAlgo] = useState('merge');
  const d3ChartRef = useRef(null);

  // Setup AlgoEngine
  const algoEngine = useAlgoEngine([], 3);

  const loadSteps = (algoKey) => {
    let steps = [];
    if (algoKey === 'bubble') steps = bubbleSort(INITIAL_PRIORITIES);
    else if (algoKey === 'selection') steps = selectionSort(INITIAL_PRIORITIES);
    else if (algoKey === 'insertion') steps = insertionSort(INITIAL_PRIORITIES);
    else if (algoKey === 'merge') steps = mergeSort(INITIAL_PRIORITIES);
    else if (algoKey === 'quick') steps = quickSort(INITIAL_PRIORITIES);
    algoEngine.setSteps(steps);
  };

  // Load steps initially and on algo change
  useEffect(() => {
    loadSteps(selectedAlgo);
  }, [selectedAlgo]);

  // Render D3 comparison bar chart
  useEffect(() => {
    if (!d3ChartRef.current) return;
    d3.select(d3ChartRef.current).selectAll("*").remove();

    const w = 240;
    const h = 100;
    const margin = { top: 10, right: 10, bottom: 20, left: 50 };
    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;

    const svg = d3.select(d3ChartRef.current)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(CHART_DATA.map(d => d.name))
      .padding(0.25);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, 700]);

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g => g.select(".domain").attr("stroke", "rgba(255,255,255,0.06)"))
      .selectAll("text")
      .attr("fill", "#64748b")
      .style("font-size", "7px")
      .style("font-family", "monospace");

    // Y Axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(3))
      .call(g => g.select(".domain").attr("stroke", "rgba(255,255,255,0.06)"))
      .selectAll("text")
      .attr("fill", "#64748b")
      .style("font-size", "7px")
      .style("font-family", "monospace");

    // Y Grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(3).tickSize(-width).tickFormat(""))
      .call(g => g.select(".domain").remove())
      .selectAll("line")
      .attr("stroke", "rgba(255,255,255,0.03)");

    // Bars
    svg.selectAll(".bar")
      .data(CHART_DATA)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.ops))
      .attr("height", d => height - y(d.ops))
      .attr("rx", 2)
      .attr("fill", d => d.color)
      .attr("opacity", d => d.name.toLowerCase() === selectedAlgo ? 1 : 0.45);
  }, [selectedAlgo]);

  // Extract variables of the current sorting step
  const currentStepData = algoEngine.steps[algoEngine.currentStep] || {};
  const currentArray = currentStepData.array || INITIAL_PRIORITIES;
  const currentComparing = currentStepData.comparing || [];
  const currentSwapping = currentStepData.swapping || [];
  const currentSorted = currentStepData.sorted || [];

  // Track stats dynamically
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  for (let idx = 0; idx <= algoEngine.currentStep; idx++) {
    const step = algoEngine.steps[idx] || {};
    if (step.comparing && step.comparing.length > 0) {
      comparisons++;
      arrayAccesses += 2;
    }
    if (step.swapping && step.swapping.length > 0) {
      swaps++;
      arrayAccesses += 4; // read 2, write 2
    }
  }

  // Check if sort is finished to show manifest table
  const isSorted = algoEngine.currentStep > 0 && algoEngine.currentStep === algoEngine.steps.length - 1;

  // Build current manifest items based on the values
  const sortedManifest = currentArray.map(val => {
    return VEHICLES.find(v => v.priority === val) || VEHICLES[0];
  });

  const complexityInfo = ALGO_COMPLEXITIES[selectedAlgo] || {};

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT PANEL: Sort visualizer & Manifest Table (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Module Header */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-fleetSort" />
              Fleet Sorter
            </h3>
            <p className="text-[10px] text-textSecondary">
              Sort a fleet of 30 delivery vehicles by composite priority scores (urgency × distance).
            </p>
          </div>
          
          {/* Select Algorithm */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-textSecondary font-mono uppercase">Algorithm:</span>
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              className="bg-[#1e293b] border border-borderColor rounded px-2 py-1 text-[11px] font-medium text-white focus:outline-none focus:border-primaryAccent"
            >
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
            </select>
          </div>
        </div>

        {/* Sort bars */}
        <SortBars
          values={currentArray}
          comparing={currentComparing}
          swapping={currentSwapping}
          sorted={currentSorted}
        />

        {/* Sorted manifest table */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#ffffff0a] pb-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText size={12} className="text-textSecondary" />
              Vehicle Manifest List
            </h4>
            {isSorted && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={10} />
                Sorted
              </span>
            )}
          </div>

          <div className="overflow-y-auto max-h-56 scrollbar-thin">
            <table className="w-full text-[9px] text-textSecondary border-collapse">
              <thead>
                <tr className="border-b border-[#ffffff08] bg-[#0c1020] text-left">
                  <th className="p-2 font-mono text-textPrimary">Rank</th>
                  <th className="p-2 font-mono text-textPrimary">Vehicle ID</th>
                  <th className="p-2 font-mono text-textPrimary">Assigned Route</th>
                  <th className="p-2 font-mono text-textPrimary text-right">Priority Score</th>
                  <th className="p-2 font-mono text-textPrimary text-right">Deadline</th>
                  <th className="p-2 font-mono text-textPrimary text-right">Cargo Weight</th>
                </tr>
              </thead>
              <tbody>
                {sortedManifest.map((veh, idx) => (
                  <tr key={veh.id} className={`border-b border-[#ffffff04] hover:bg-[#ffffff02] ${
                    isSorted && idx < 5 ? 'bg-emerald-500/5' : ''
                  }`}>
                    <td className="p-2 font-mono font-bold text-textPrimary">{idx + 1}</td>
                    <td className="p-2 font-mono text-white font-semibold">{veh.id}</td>
                    <td className="p-2 font-mono">{veh.route}</td>
                    <td className="p-2 font-mono text-right text-emerald-400 font-bold">
                      {veh.priority.toFixed(1)}
                    </td>
                    <td className="p-2 font-mono text-right">{veh.deadline}</td>
                    <td className="p-2 font-mono text-right">{veh.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Stats, Charts, Complexity & StepControls (1/3 width) */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Real-time stats */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-3 shrink-0">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Live Sort Statistics</h4>
          
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Comparisons</span>
              <span className="text-sm font-bold text-amber-400">{comparisons}</span>
            </div>
            
            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Swaps/Shifts</span>
              <span className="text-sm font-bold text-rose-500">{swaps}</span>
            </div>

            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Array Accesses</span>
              <span className="text-sm font-bold text-blue-400">{arrayAccesses}</span>
            </div>

            <div className="bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              <span className="text-[8px] text-textSecondary uppercase block">Sim Time</span>
              <span className="text-sm font-bold text-white">{(comparisons * 0.005 + swaps * 0.01).toFixed(2)} ms</span>
            </div>
          </div>
        </div>

        {/* StepControls */}
        <div className="shrink-0">
          <StepControls {...algoEngine} />
        </div>

        {/* Complexity and D3 Chart */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 space-y-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <BarChart2 size={14} className="text-purple-400" />
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Relative Performance (N=30)</h4>
          </div>

          <div className="flex justify-center border-b border-[#ffffff05] pb-3">
            <div ref={d3ChartRef} />
          </div>

          {/* Theoretical complex text block */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-textSecondary font-medium">{complexityInfo.name} Bound:</span>
              <span className="font-mono text-purple-400 font-bold">{complexityInfo.time} Time</span>
            </div>
            <p className="text-[9px] text-textSecondary leading-relaxed bg-[#0c1020] p-2 rounded border border-[#ffffff05]">
              {complexityInfo.desc}
            </p>
          </div>
        </div>

        {/* AlgoEngineConsole */}
        <div className="flex-1 min-h-[160px]">
          <AlgoEngineLog
            algoName={complexityInfo.name}
            timeComplexity={complexityInfo.time}
            spaceComplexity={complexityInfo.space}
            steps={algoEngine.steps}
            currentStep={algoEngine.currentStep}
            executionTime={`${(comparisons * 0.005 + swaps * 0.01).toFixed(2)} ms`}
          />
        </div>
      </div>
    </div>
  );
}
