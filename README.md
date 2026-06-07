# RouteIQ — Intelligent Operations Platform

RouteIQ is a professional-grade logistics, municipal engineering, and urban operations management web application. Structured as a Vite-based React single-page application (SPA), it operates fully in-browser with zero external backend dependencies. All data, graph visualizations, heap trees, and dynamic programming matrices are calculated and animated in real-time.

The platform is designed around the metropolitan context of Bengaluru (Bangalore), using real-world municipal problems (grid layout, road network routing, water and electrical infrastructures, and ticketing queues) to demonstrate core computer science algorithms in a production-ready SaaS interface.

---

## 🎨 Design System

RouteIQ uses a curated, premium dark theme layout:
- **Base Background**: `#080c18` (deep navy-black)
- **Sidebar Background**: `#0c1020` (slate-dark navy)
- **Card Background**: `#0f1628` (solid card navy)
- **Borders**: `rgba(255, 255, 255, 0.07)` (applied as `0.5px` borders to all panels)
- **Primary Accent**: `#3b82f6` (blue)
- **Text Hierarchy**: 
  - Primary: `#e2e8f0`
  - Secondary: `#64748b`
  - Muted: `#334155`
- **Typography**: Inter & JetBrains Mono (for logs/terminal consoles) from Google Fonts.
- **Module Accent Palette**:
  - 🟣 **Route Optimizer**: `#8b5cf6` (violet)
  - 🟢 **Fleet Sorter**: `#10b981` (emerald)
  - 🟡 **Network Mapper**: `#f59e0b` (amber)
  - 🔴 **Budget Allocator**: `#ef4444` (red)
  - 🔵 **Scheduler**: `#06b6d4` (cyan)
  - 💗 **Document Search**: `#ec4899` (pink)
  - 🟢 **Grid Planner**: `#84cc16` (lime)
  - 🟠 **Ticket Queue**: `#f97316` (orange)

---

## 🧭 Application Modules & Algorithms

### 1. Dashboard Overview
- **Metrics Panel**: High-level KPIs tracking active routes, cost reductions, budget utilizations, and task queues.
- **Bengaluru Grid Map**: Interactive 8-node force-directed graph. Clicking a source and target node runs the real-world Dijkstra solver to highlight shortest routes in cyan/blue.
- **Live Operations Feed**: A simulated terminal logging algorithm occurrences automatically every 3 seconds.

### 2. Route Optimizer
- **Shortest Paths**: Interactive 10-node road grid spanning Bengaluru. Clicking node pairings animates Dijkstra relaxation step-by-step.
- **All-Pairs Matrices**: Computes the full distance matrix between all localities using the Floyd-Warshall algorithm.
- **Reachability Closure**: Displays boolean connectivity using Warshall's transitive closure.

### 3. Fleet Sorter
- **Urgency Arranger**: Visualizes 30 vehicle priority scores (derived from deadline × weight × distance).
- **Sorting Algorithms**: Step-by-step visualizers comparing **Bubble Sort**, **Selection Sort**, **Insertion Sort**, **Merge Sort**, and **Quick Sort**.
- **Efficiency Benchmarks**: Draws a D3 bar chart illustrating average operations count. Computes comparisons, swaps, and array accesses in real-time.

### 4. Network Mapper
- **All-Pairs Heatmap**: Animates Floyd-Warshall cell updates, mapping distances onto a color-interpolated heatmap.
- **Connectivity Check**: Colors graph nodes by connected component, updating components dynamically as users connect/disconnect edges.
- **Traversal comparison**: Runs DFS (stack-based) and BFS (queue-based) side-by-side.
- **Topological Kahn Sort**: Coordinates a dependency DAG of metro construction phases as a linear timeline.

### 5. Budget Allocator
- **BBMP Project Packing**: Toggles force-include/force-exclude configurations on 10 municipal project proposals with cost and benefit values.
- **Knapsack Solver**: Animates 0/1 Knapsack cell-by-cell row filling alongside a comparison with Greedy Fractional Knapsack.
- **Memory Functions**: Isolates top-down memoized recursion branches by blanking out un-evaluated matrix nodes.
- **Binomial C(10, k)**: Generates Pascal's triangle table showing combinatorics for selecting subsets of projects.

### 6. Scheduler
- **Weekly Event Grid**: Backtracks event bookings on an $N \times N$ schedule without column/row/diagonal conflicts (N-Queens, $N=4 \text{ to } 8$).
- **Resource Matching**: Scans a backtracking tree to match 10 invoices with a target grant budget (Subset Sum).
- **Patrol TSP**: Solves 6 fire station route paths using Branch & Bound search bounding calculations.
- **Shift Matchmaker**: Assigns 5 workers to 5 shifts with minimal cost, drawing an interactive SVG node-matching diagram.

### 7. Document Search
- **Substring Scanners**: Slides pattern keywords underneath 800+ characters of civic record reports comparing **Boyer-Moore** (bad character/good suffix rules), **Horspool's**, and **Naive search**.
- **Presorting Demo**: Simulates linear querying vs alphabet-sorted binary search over 20 municipal keywords.

### 8. Grid Planner
- **Power Cable Grid**: Evaluates minimum laying costs for residential sectors using **Prim's Spanning Tree (MST)**, rendering the explored cuts in different shades.
- **Huffman Compression**: Builds bottom-up frequency merge trees from district logs, calculating bits conservation and ratios.

### 9. Ticket Queue
- **Heap priority queue**: Ingests municipal maintenance tickets (Potholes, sewage, water) every 4 seconds.
- **Binary Tree Heap**: Renders a max-heap where insertions trigger bubble-ups and serving triggers sift-down animations.
- **Heapsort Manifest**: Runs the full Heapsort sorting sequence on the active queue.

---

## 🛠️ Codebase Structure

```bash
src/
  ├── algorithms/                # Pure algorithm engines returning steps arrays
  │     ├── sorting.js
  │     ├── graph.js
  │     ├── dp.js
  │     ├── backtracking.js
  │     └── stringMatch.js
  ├── components/                # Reusable UI controls, consoles, and graphs
  │     ├── Sidebar.jsx
  │     ├── Topbar.jsx
  │     ├── KPICard.jsx
  │     ├── AlgoEngineLog.jsx
  │     ├── NetworkGraph.jsx
  │     ├── SortBars.jsx
  │     └── StepControls.jsx
  ├── hooks/                     # Custom hooks
  │     └── useAlgoEngine.js
  ├── pages/                     # Core page portals
  │     ├── Dashboard.jsx
  │     ├── RouteOptimizer.jsx
  │     ├── FleetSorter.jsx
  │     ├── NetworkMapper.jsx
  │     ├── BudgetAllocator.jsx
  │     ├── Scheduler.jsx
  │     ├── DocumentSearch.jsx
  │     ├── GridPlanner.jsx
  │     └── TicketQueue.jsx
  ├── App.jsx                    # Root router layout
  ├── main.jsx                   # React entrypoint
  └── index.css                  # CSS base styling & scrollbars
```

---

## 🚀 Getting Started

### Prerequisites
Ensure you have **Node.js** (v16+) installed.

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Run Development Server
Launch the local Hot-Module-Replacement (HMR) server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Compile Production Build
Bundle client files for deployment:
```bash
npm run build
```
Compiled assets will be output in `dist/`.
