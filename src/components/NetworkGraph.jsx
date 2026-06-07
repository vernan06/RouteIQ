// src/components/NetworkGraph.jsx
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

export default function NetworkGraph({
  nodes = [],
  edges = [],
  highlightPath = [],
  visitedNodes = [],
  selectedNodes = [], // source/target selected
  currentNode = null, // currently relaxed
  comparingEdge = null,
  onNodeClick,
  width = 600,
  height = 400
}) {
  const [coords, setCoords] = useState({});
  const svgRef = useRef(null);

  // Run simulation once per node-set change to compute layout coordinates
  useEffect(() => {
    if (nodes.length === 0) return;

    // Create deep copies to avoid mutating props
    const simNodes = nodes.map(d => ({ ...d }));
    const simLinks = edges.map(d => ({
      ...d,
      source: simNodes.find(n => n.id === d.source) || d.source,
      target: simNodes.find(n => n.id === d.target) || d.target
    }));

    // Pre-assign coordinate circles if nodes have coordinates, else simulate
    const hasPositions = nodes.every(n => n.x !== undefined && n.y !== undefined);

    if (hasPositions) {
      const positionCoords = {};
      nodes.forEach(n => {
        positionCoords[n.id] = { x: n.x, y: n.y };
      });
      setCoords(positionCoords);
      return;
    }

    // Run D3 simulation
    const simulation = d3.forceSimulation(simNodes)
      .force("link", d3.forceLink(simLinks).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))
      .stop();

    // Run simulation to static state
    for (let i = 0; i < 300; ++i) simulation.tick();

    const newCoords = {};
    simNodes.forEach(n => {
      // Constrain coordinates within SVG bounds
      const padding = 30;
      newCoords[n.id] = {
        x: Math.max(padding, Math.min(width - padding, n.x)),
        y: Math.max(padding, Math.min(height - padding, n.y))
      };
    });

    setCoords(newCoords);
  }, [nodes, edges, width, height]);

  // Helper to check if edge is in the highlighted path
  const isEdgeHighlighted = (source, target) => {
    if (highlightPath.length < 2) return false;
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const u = highlightPath[i];
      const v = highlightPath[i + 1];
      if ((u === source && v === target) || (u === target && v === source)) {
        return true;
      }
    }
    return false;
  };

  // Helper to check if edge is currently being relaxed/compared
  const isEdgeComparing = (source, target) => {
    if (!comparingEdge) return false;
    return (
      (comparingEdge.source === source && comparingEdge.target === target) ||
      (comparingEdge.source === target && comparingEdge.target === source)
    );
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="bg-[#0b0e1a] border border-[#ffffff0a] rounded-lg shadow-lg"
    >
      {/* Definitions for arrow markers / filters */}
      <defs>
        <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Render Edges */}
      <g>
        {edges.map((edge, idx) => {
          const u = coords[edge.source];
          const v = coords[edge.target];
          if (!u || !v) return null;

          const isHighlighted = isEdgeHighlighted(edge.source, edge.target);
          const isComparing = isEdgeComparing(edge.source, edge.target);

          let strokeColor = 'rgba(255, 255, 255, 0.08)';
          let strokeWidth = 1.5;
          let dashArray = undefined;
          let filter = undefined;

          if (isHighlighted) {
            strokeColor = '#06b6d4'; // Cyan/blue path
            strokeWidth = 3;
            filter = 'url(#glow-blue)';
          } else if (isComparing) {
            strokeColor = '#f59e0b'; // Amber relaxation
            strokeWidth = 2.5;
            dashArray = '4 4';
          }

          return (
            <g key={idx}>
              <line
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                filter={filter}
                className="transition-all duration-300"
              />
              
              {/* Edge weight badge */}
              {edge.weight !== undefined && (
                <g transform={`translate(${(u.x + v.x) / 2}, ${(u.y + v.y) / 2})`}>
                  <rect
                    x="-12"
                    y="-8"
                    width="24"
                    height="16"
                    rx="3"
                    fill="#0f1628"
                    stroke={isHighlighted ? '#06b6d4' : isComparing ? '#f59e0b' : 'rgba(255,255,255,0.06)'}
                    strokeWidth="0.5"
                  />
                  <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="text-[9px] font-mono fill-textSecondary font-bold"
                    y="1"
                  >
                    {edge.weight}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* Render Nodes */}
      <g>
        {nodes.map(node => {
          const coord = coords[node.id];
          if (!coord) return null;

          const isSelected = selectedNodes.includes(node.id);
          const isVisited = visitedNodes.includes(node.id);
          const isCurrent = currentNode === node.id;

          let ringColor = 'rgba(255, 255, 255, 0.2)';
          let bgColor = '#0f1628';
          let borderWeight = 1.5;
          let nodeGlow = undefined;

          if (isCurrent) {
            ringColor = '#8b5cf6'; // Violet pulse
            bgColor = 'rgba(139, 92, 246, 0.2)';
            borderWeight = 2.5;
            nodeGlow = 'url(#glow-violet)';
          } else if (isSelected) {
            ringColor = '#06b6d4'; // Cyan selected
            bgColor = 'rgba(6, 182, 212, 0.2)';
            borderWeight = 2.5;
          } else if (isVisited) {
            ringColor = '#8b5cf6'; // Violet visited
            bgColor = 'rgba(139, 92, 246, 0.08)';
          }

          return (
            <g
              key={node.id}
              transform={`translate(${coord.x}, ${coord.y})`}
              onClick={() => onNodeClick?.(node.id)}
              className="cursor-pointer group select-none"
            >
              {/* Outer pulsing ring for active node */}
              {isCurrent && (
                <circle
                  r="20"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="1"
                  className="animate-ping opacity-75"
                />
              )}

              {/* Node base circle */}
              <circle
                r="13"
                fill={bgColor}
                stroke={ringColor}
                strokeWidth={borderWeight}
                filter={nodeGlow}
                className="transition-all duration-300 group-hover:stroke-white/60"
              />

              {/* Node ID label code */}
              <text
                textAnchor="middle"
                alignmentBaseline="middle"
                className="text-[9px] font-mono font-bold fill-white pointer-events-none"
                y="1"
              >
                {node.id}
              </text>

              {/* Full locality name display label */}
              <g transform="translate(0, 24)">
                <rect
                  x="-35"
                  y="-8"
                  width="70"
                  height="15"
                  rx="3"
                  fill="rgba(8, 12, 24, 0.85)"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                />
                <text
                  textAnchor="middle"
                  className="text-[8px] fill-textSecondary font-medium group-hover:fill-textPrimary transition-colors"
                >
                  {node.label || node.id}
                </text>
              </g>

              {/* Small custom tooltip showing node details */}
              <title>
                {node.label || node.id} {isVisited ? '(Visited)' : ''}
              </title>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
