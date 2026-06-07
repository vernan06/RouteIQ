// src/pages/GridPlanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import StepControls from '../components/StepControls';
import AlgoEngineLog from '../components/AlgoEngineLog';
import useAlgoEngine from '../hooks/useAlgoEngine';
import { primsMST, floydWarshall } from '../algorithms/graph';
import { huffmanCoding } from '../algorithms/dp';
import * as d3 from 'd3';
import { Zap, Archive, CheckCircle2, ChevronRight, Binary } from 'lucide-react';

const SECTOR_NODES = [
  { id: 'S1', label: 'Sector 1', x: 80, y: 70 },
  { id: 'S2', label: 'Sector 2', x: 220, y: 40 },
  { id: 'S3', label: 'Sector 3', x: 290, y: 120 },
  { id: 'S4', label: 'Sector 4', x: 250, y: 240 },
  { id: 'S5', label: 'Sector 5', x: 110, y: 220 },
  { id: 'S6', label: 'Sector 6', x: 70, y: 130 },
  { id: 'S7', label: 'Sector 7', x: 180, y: 140 },
  { id: 'S8', label: 'Sector 8', x: 190, y: 210 }
];

const SECTOR_EDGES = [
  { source: 'S1', target: 'S2', weight: 12 },
  { source: 'S1', target: 'S6', weight: 7 },
  { source: 'S1', target: 'S7', weight: 9 },
  { source: 'S2', target: 'S3', weight: 15 },
  { source: 'S2', target: 'S7', weight: 8 },
  { source: 'S3', target: 'S4', weight: 6 },
  { source: 'S3', target: 'S7', weight: 10 },
  { source: 'S3', target: 'S8', weight: 5 },
  { source: 'S4', target: 'S5', weight: 14 },
  { source: 'S4', target: 'S8', weight: 8 },
  { source: 'S5', target: 'S6', weight: 11 },
  { source: 'S5', target: 'S8', weight: 9 },
  { source: 'S6', target: 'S7', weight: 5 },
  { source: 'S7', target: 'S8', weight: 4 }
];

const DISTRICT_FREQS = [
  { name: 'Koramangala', count: 45 },
  { name: 'Indiranagar', count: 35 },
  { name: 'HSR Layout', count: 25 },
  { name: 'Whitefield', count: 20 },
  { name: 'Hebbal', count: 18 },
  { name: 'Jayanagar', count: 15 },
  { name: 'BTM Layout', count: 12 },
  { name: 'Electronic City', count: 10 }
];

export default function GridPlanner() {
  const primEngine = useAlgoEngine([], 2);
  const huffEngine = useAlgoEngine([], 2);
  const huffTreeSvgRef = useRef(null);

  const runPrim = () => {
    const steps = primsMST(SECTOR_NODES.map(n => n.id), SECTOR_EDGES);
    primEngine.setSteps(steps);
  };

  const runHuffman = () => {
    const { steps } = huffmanCoding(DISTRICT_FREQS);
    huffEngine.setSteps(steps);
  };

  useEffect(() => {
    runPrim();
    runHuffman();
  }, []);

  // 1. Prim's variables extraction
  const primStepData = primEngine.steps[primEngine.currentStep] || {};
  const primMstEdges = primStepData.mstEdges || [];
  const primVisited = primStepData.visitedNodes || [];
  const primCurrentEdge = primStepData.currentEdge || null;
  const primCost = primStepData.totalCost || 0;

  // Render Huffman tree in D3
  useEffect(() => {
    if (!huffTreeSvgRef.current) return;
    d3.select(huffTreeSvgRef.current).selectAll("*").remove();

    const currentHuffStep = huffEngine.steps[huffEngine.currentStep] || {};
    const forestRoots = currentHuffStep.nodes || [];
    const selectedIds = currentHuffStep.selected || [];

    const width = 310;
    const height = 230;

    const svg = d3.select(huffTreeSvgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(0, 20)");

    // If we have multiple roots, we display them side-by-side
    // If we have 1 root, we can display the complete tree hierarchy
    if (forestRoots.length === 0) return;

    if (forestRoots.length === 1) {
      // Draw single complete tree using D3 tree layout
      const treeData = forestRoots[0];
      const root = d3.hierarchy(treeData);
      
      const treeLayout = d3.tree().size([width - 40, height - 60]);
      treeLayout(root);

      const g = svg.append("g").attr("transform", "translate(20, 10)");

      // Links
      g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", "rgba(255,255,255,0.08)")
        .attr("stroke-width", 1);

      // Node labels along links (0 or 1)
      g.selectAll(".link-label")
        .data(root.links())
        .enter()
        .append("text")
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .style("font-size", "7px")
        .style("font-family", "monospace")
        .text((d, idx) => d.source.left === d.target ? "0" : "1");

      // Nodes
      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

      node.append("circle")
        .attr("r", d => d.data.name ? 10 : 7)
        .attr("fill", d => d.data.name ? "#84cc16" : "#0f1628")
        .attr("stroke", d => d.data.name ? "none" : "rgba(255,255,255,0.2)")
        .attr("stroke-width", 1);

      node.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#000")
        .style("font-size", "7px")
        .style("font-weight", "bold")
        .text(d => d.data.name ? d.data.name.slice(0, 3) : "");

      node.append("text")
        .attr("dy", d => d.data.name ? 18 : 14)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .style("font-size", "7px")
        .text(d => d.data.count);

    } else {
      // Display forest roots side by side horizontally
      const spacing = width / forestRoots.length;
      
      forestRoots.forEach((rootNode, idx) => {
        const xPos = idx * spacing + spacing / 2;
        const yPos = height / 2;

        const isSelected = selectedIds.includes(rootNode.id);

        const nodeGroup = svg.append("g")
          .attr("transform", `translate(${xPos}, ${yPos})`);

        nodeGroup.append("circle")
          .attr("r", 14)
          .attr("fill", isSelected ? "rgba(245,158,11,0.2)" : "#0f1628")
          .attr("stroke", isSelected ? "#f59e0b" : "rgba(255,255,255,0.15)")
          .attr("stroke-width", isSelected ? 2 : 1);

        nodeGroup.append("text")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("fill", "#fff")
          .style("font-size", "8px")
          .style("font-family", "monospace")
          .text(rootNode.name ? rootNode.name.slice(0, 3) : `M${idx}`);

        nodeGroup.append("text")
          .attr("dy", 22)
          .attr("text-anchor", "middle")
          .attr("fill", "#64748b")
          .style("font-size", "8px")
          .text(`Freq: ${rootNode.count}`);
      });
    }
  }, [huffEngine.currentStep]);

  // Huffman table output & stats
  const currentHuffStepData = huffEngine.steps[huffEngine.currentStep] || {};
  const huffCodes = currentHuffStepData.codes || {};

  // Compression calculations
  let originalBits = 0;
  let compressedBits = 0;
  DISTRICT_FREQS.forEach(d => {
    originalBits += d.count * 8; // 8-bit ASCII
    const codeLength = huffCodes[d.name]?.length || 3;
    compressedBits += d.count * codeLength;
  });
  const compressionRatio = originalBits > 0 ? ((1 - (compressedBits / originalBits)) * 100).toFixed(1) : 0;

  // Convert prim MST edges to IDs for graph display
  const primHighlightPath = [];
  // For NetworkGraph, we can pass tree edges or customize link coloring.
  // Let's pass the primMstEdges inside NetworkGraph as a custom highlight list by converting edge source/target
  // to strings, which is standard. To display MST edges properly, let's map them to edge structures.
  const mstMap = primMstEdges.map(e => `${e.source}-${e.target}`);
  if (primCurrentEdge) {
    mstMap.push(`${primCurrentEdge.source}-${primCurrentEdge.target}`);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* LEFT COLUMN: Prim's MST Power Grid (1/2 width) */}
      <div className="space-y-6">
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gridPlan" />
              Prim's Power Grid MST
            </h3>
            <p className="text-[10px] text-textSecondary">
              Build minimum-cost cables (green) to connect residential sectors.
            </p>
          </div>
          <button
            onClick={runPrim}
            className="px-2.5 py-1 text-[10px] font-bold text-white bg-[#84cc16] hover:bg-lime-600 rounded transition-colors"
          >
            Compute Grid
          </button>
        </div>

        {/* MST Canvas graph */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col h-[320px] relative overflow-hidden">
          <div className="flex-1 min-h-0">
            {/* Display cut shades by coloring visited sectors green/white */}
            <NetworkGraph
              nodes={SECTOR_NODES}
              edges={SECTOR_EDGES.map(e => {
                const isMST = mstMap.includes(`${e.source}-${e.target}`) || mstMap.includes(`${e.target}-${e.source}`);
                return {
                  ...e,
                  weight: e.weight
                };
              })}
              highlightPath={[]} // We will override edge highlight using visitedNodes
              visitedNodes={primVisited}
              selectedNodes={primCurrentEdge ? [primCurrentEdge.source, primCurrentEdge.target] : []}
              width={500}
              height={260}
            />
          </div>

          {/* Running cost banner */}
          <div className="absolute top-4 right-4 bg-[#111827] border border-[#ffffff0a] p-2 rounded text-[10px] font-mono flex gap-4">
            <div>
              <span className="text-textSecondary uppercase block text-[8px]">Visited</span>
              <span className="text-white font-bold">{primVisited.length} / 8</span>
            </div>
            <div className="border-l border-[#ffffff08] pl-4">
              <span className="text-textSecondary uppercase block text-[8px]">MST Cost</span>
              <span className="text-[#84cc16] font-bold">{primCost} ₹L</span>
            </div>
          </div>
        </div>

        <StepControls {...primEngine} />

        <div className="h-[160px]">
          <AlgoEngineLog
            algoName="Prim's Minimum Spanning Tree"
            timeComplexity="O(E log V)"
            spaceComplexity="O(V + E)"
            steps={primEngine.steps}
            currentStep={primEngine.currentStep}
            executionTime="0.18 ms"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Huffman Coding Log Compressor (1/2 width) */}
      <div className="space-y-6">
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-docSearch" />
              Huffman Log Compressor
            </h3>
            <p className="text-[10px] text-textSecondary">
              Compress transmission logs using bottom-up priority queue tree merges.
            </p>
          </div>
          <button
            onClick={runHuffman}
            className="px-2.5 py-1 text-[10px] font-bold text-white bg-primaryAccent hover:bg-blue-600 rounded transition-colors"
          >
            Compute Tree
          </button>
        </div>

        {/* Huffman Tree D3 visualization */}
        <div className="bg-cardBg border border-borderColor rounded-lg p-4 flex flex-col items-center justify-center h-[320px] relative">
          <div className="w-full flex items-center justify-between mb-2 shrink-0">
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
              Tree Merge States (Forest Queue)
            </span>
          </div>

          <div className="flex-1 min-h-0" ref={huffTreeSvgRef} />

          {/* Compression stats overlay */}
          <div className="absolute top-4 right-4 bg-[#111827] border border-[#ffffff0a] p-2 rounded text-[9px] font-mono space-y-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-textSecondary">Raw (8-bit):</span>
              <span className="text-white font-bold">{originalBits} b</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-textSecondary">Compressed:</span>
              <span className="text-white font-bold">{compressedBits} b</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#ffffff0a] pt-1">
              <span className="text-textSecondary">Ratio:</span>
              <span className="text-emerald-400 font-bold">+{compressionRatio}%</span>
            </div>
          </div>
        </div>

        <StepControls {...huffEngine} />

        <div className="h-[160px]">
          <AlgoEngineLog
            algoName="Huffman Coding Tree Builder"
            timeComplexity="O(N log N)"
            spaceComplexity="O(N)"
            steps={huffEngine.steps}
            currentStep={huffEngine.currentStep}
            executionTime="0.12 ms"
          />
        </div>
      </div>
    </div>
  );
}
