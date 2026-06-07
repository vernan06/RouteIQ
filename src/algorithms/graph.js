// src/algorithms/graph.js

/**
 * Dijkstra's Algorithm
 * @param {Array} nodes - list of node ids, e.g. ['KOR', 'IND']
 * @param {Array} edges - list of { source, target, weight }
 * @param {string} source - start node id
 * @param {string} target - optional end node id
 */
export function dijkstra(nodes, edges, source, target = null) {
  const steps = [];
  const dist = {};
  const prev = {};
  const visited = new Set();

  // Initialize
  nodes.forEach(node => {
    dist[node] = Infinity;
    prev[node] = null;
  });
  dist[source] = 0;

  steps.push({
    visited: [],
    distances: { ...dist },
    current: null,
    path: [],
    description: `Initialize Dijkstra from source ${source}. Distance to ${source} is 0, all others Infinity.`
  });

  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current = null;
    let minDist = Infinity;
    unvisited.forEach(node => {
      if (dist[node] < minDist) {
        minDist = dist[node];
        current = node;
      }
    });

    if (current === null) {
      steps.push({
        visited: Array.from(visited),
        distances: { ...dist },
        current: null,
        path: [],
        description: "All remaining reachable nodes have been processed."
      });
      break;
    }

    // Mark as visited
    unvisited.delete(current);
    visited.add(current);

    steps.push({
      visited: Array.from(visited),
      distances: { ...dist },
      current,
      path: reconstructPath(prev, current, source),
      description: `Select unvisited node ${current} with minimum distance ${dist[current]} km`
    });

    if (target && current === target) {
      steps.push({
        visited: Array.from(visited),
        distances: { ...dist },
        current,
        path: reconstructPath(prev, target, source),
        description: `Target node ${target} reached. Shortest distance is ${dist[target]} km.`
      });
      break;
    }

    // Get neighbors
    const neighbors = edges.filter(e => e.source === current || e.target === current);
    neighbors.forEach(edge => {
      const neighbor = edge.source === current ? edge.target : edge.source;
      if (!visited.has(neighbor)) {
        const alt = dist[current] + edge.weight;
        steps.push({
          visited: Array.from(visited),
          distances: { ...dist },
          current,
          path: reconstructPath(prev, current, source),
          comparingEdge: { source: current, target: neighbor },
          description: `Check neighbor ${neighbor}. Cost: ${dist[current]} + ${edge.weight} = ${alt}`
        });

        if (alt < dist[neighbor]) {
          dist[neighbor] = alt;
          prev[neighbor] = current;
          steps.push({
            visited: Array.from(visited),
            distances: { ...dist },
            current,
            path: reconstructPath(prev, current, source),
            description: `Relax edge ${current} → ${neighbor}. Update distance to ${neighbor} to ${alt} km.`
          });
        }
      }
    });
  }

  // Final step
  steps.push({
    visited: Array.from(visited),
    distances: { ...dist },
    current: null,
    path: target ? reconstructPath(prev, target, source) : [],
    description: "Dijkstra execution finished."
  });

  return steps;
}

function reconstructPath(prev, node, source) {
  const path = [];
  let curr = node;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path[0] === source ? path : [];
}

/**
 * Floyd-Warshall Algorithm
 * @param {Array} nodes - list of node ids
 * @param {Array} edges - list of { source, target, weight } (undirected in our case, or directed)
 */
export function floydWarshall(nodes, edges) {
  const steps = [];
  const n = nodes.length;
  const nodeMap = {};
  nodes.forEach((node, idx) => {
    nodeMap[node] = idx;
  });

  // Initialize matrix
  let matrix = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) matrix[i][i] = 0;

  edges.forEach(e => {
    const u = nodeMap[e.source];
    const v = nodeMap[e.target];
    if (u !== undefined && v !== undefined) {
      matrix[u][v] = e.weight;
      matrix[v][u] = e.weight; // Undirected road network
    }
  });

  // Clone helper
  const cloneMatrix = mat => mat.map(row => [...row]);

  steps.push({
    matrix: cloneMatrix(matrix),
    k: -1,
    i: -1,
    j: -1,
    updated: false,
    description: "Initialize distance matrix with direct edge weights."
  });

  for (let k = 0; k < n; k++) {
    const kNode = nodes[k];
    steps.push({
      matrix: cloneMatrix(matrix),
      k,
      i: -1,
      j: -1,
      updated: false,
      description: `Consider intermediate node ${kNode}`
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === k || j === k || i === j) continue;

        const currentDist = matrix[i][j];
        const newDist = matrix[i][k] + matrix[k][j];
        const wasUpdated = newDist < currentDist;

        if (wasUpdated) {
          matrix[i][j] = newDist;
        }

        steps.push({
          matrix: cloneMatrix(matrix),
          k,
          i,
          j,
          updated: wasUpdated,
          description: `Compare: Path ${nodes[i]}→${nodes[j]} (${currentDist === Infinity ? '∞' : currentDist} km) vs via ${nodes[k]} (${newDist === Infinity ? '∞' : newDist} km). ${wasUpdated ? 'Updated!' : 'No change.'}`
        });
      }
    }
  }

  steps.push({
    matrix: cloneMatrix(matrix),
    k: n,
    i: -1,
    j: -1,
    updated: false,
    description: "Floyd-Warshall completed. All pairs shortest path computed."
  });

  return steps;
}

/**
 * Warshall's reachability Algorithm
 */
export function warshall(nodes, edges) {
  const steps = [];
  const n = nodes.length;
  const nodeMap = {};
  nodes.forEach((node, idx) => {
    nodeMap[node] = idx;
  });

  let matrix = Array.from({ length: n }, () => Array(n).fill(false));
  for (let i = 0; i < n; i++) matrix[i][i] = true;

  edges.forEach(e => {
    const u = nodeMap[e.source];
    const v = nodeMap[e.target];
    if (u !== undefined && v !== undefined) {
      matrix[u][v] = true;
      matrix[v][u] = true; // Undirected
    }
  });

  const cloneMatrix = mat => mat.map(row => [...row]);

  steps.push({
    matrix: cloneMatrix(matrix),
    k: -1,
    i: -1,
    j: -1,
    updated: false,
    description: "Initialize adjacency/reachability matrix."
  });

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][k] && matrix[k][j]) {
          const wasUpdated = !matrix[i][j];
          if (wasUpdated) {
            matrix[i][j] = true;
          }
          steps.push({
            matrix: cloneMatrix(matrix),
            k,
            i,
            j,
            updated: wasUpdated,
            description: `Path found between ${nodes[i]} and ${nodes[j]} via ${nodes[k]}. ${wasUpdated ? 'Cell updated to TRUE.' : 'Already reachable.'}`
          });
        }
      }
    }
  }

  steps.push({
    matrix: cloneMatrix(matrix),
    k: n,
    i: -1,
    j: -1,
    updated: false,
    description: "Warshall's reachability complete."
  });

  return steps;
}

/**
 * Prim's MST
 */
export function primsMST(nodes, edges) {
  const steps = [];
  const visitedNodes = new Set();
  const mstEdges = [];
  let totalCost = 0;

  if (nodes.length === 0) return [];

  // Start with the first node
  const startNode = nodes[0];
  visitedNodes.add(startNode);

  steps.push({
    mstEdges: [],
    visitedNodes: Array.from(visitedNodes),
    currentEdge: null,
    totalCost: 0,
    description: `Start Prim's MST at node ${startNode}.`
  });

  while (visitedNodes.size < nodes.length) {
    let minEdge = null;
    let minWeight = Infinity;

    // Look for all edges that cross the cut: u visited, v unvisited
    edges.forEach(edge => {
      const uVisited = visitedNodes.has(edge.source);
      const vVisited = visitedNodes.has(edge.target);

      if ((uVisited && !vVisited) || (!uVisited && vVisited)) {
        if (edge.weight < minWeight) {
          minWeight = edge.weight;
          minEdge = edge;
        }
      }
    });

    if (minEdge === null) {
      // Graph is disconnected
      steps.push({
        mstEdges: [...mstEdges],
        visitedNodes: Array.from(visitedNodes),
        currentEdge: null,
        totalCost,
        description: "No more crossing edges found. Graph might be disconnected."
      });
      break;
    }

    const nextNode = visitedNodes.has(minEdge.source) ? minEdge.target : minEdge.source;
    visitedNodes.add(nextNode);
    mstEdges.push(minEdge);
    totalCost += minEdge.weight;

    steps.push({
      mstEdges: [...mstEdges],
      visitedNodes: Array.from(visitedNodes),
      currentEdge: minEdge,
      totalCost,
      description: `Select minimum weight crossing edge ${minEdge.source} — ${minEdge.target} (${minEdge.weight} ₹L). Add ${nextNode} to MST.`
    });
  }

  steps.push({
    mstEdges: [...mstEdges],
    visitedNodes: Array.from(visitedNodes),
    currentEdge: null,
    totalCost,
    description: `Prim's MST complete. Total cost is ${totalCost} ₹L.`
  });

  return steps;
}

/**
 * DFS
 */
export function dfs(nodes, edges, start) {
  const steps = [];
  const visited = new Set();
  const stack = [start];
  const treeEdges = [];

  // Adjacency list
  const adj = {};
  nodes.forEach(n => adj[n] = []);
  edges.forEach(e => {
    adj[e.source].push(e.target);
    adj[e.target].push(e.source);
  });

  steps.push({
    visited: [],
    stack: [...stack],
    currentNode: null,
    treeEdges: [],
    description: `Start DFS traversal. Initialize stack with starting node ${start}.`
  });

  const parent = {};

  while (stack.length > 0) {
    const current = stack.pop();

    if (!visited.has(current)) {
      visited.add(current);
      if (parent[current]) {
        treeEdges.push({ source: parent[current], target: current });
      }

      steps.push({
        visited: Array.from(visited),
        stack: [...stack],
        currentNode: current,
        treeEdges: [...treeEdges],
        description: `Pop and visit node ${current}. Mark as visited.`
      });

      // Push neighbors to stack
      const neighbors = adj[current].filter(n => !visited.has(n));
      // Sort neighbors to have deterministic ordering (optional)
      neighbors.sort().reverse().forEach(neighbor => {
        if (!stack.includes(neighbor)) {
          stack.push(neighbor);
          parent[neighbor] = current;
        }
      });

      if (neighbors.length > 0) {
        steps.push({
          visited: Array.from(visited),
          stack: [...stack],
          currentNode: current,
          treeEdges: [...treeEdges],
          description: `Push unvisited neighbors to stack: ${neighbors.join(', ')}`
        });
      }
    }
  }

  steps.push({
    visited: Array.from(visited),
    stack: [],
    currentNode: null,
    treeEdges: [...treeEdges],
    description: "DFS traversal completed."
  });

  return steps;
}

/**
 * BFS
 */
export function bfs(nodes, edges, start) {
  const steps = [];
  const visited = new Set([start]);
  const queue = [start];
  const treeEdges = [];

  const adj = {};
  nodes.forEach(n => adj[n] = []);
  edges.forEach(e => {
    adj[e.source].push(e.target);
    adj[e.target].push(e.source);
  });

  steps.push({
    visited: [start],
    queue: [...queue],
    currentNode: null,
    treeEdges: [],
    description: `Start BFS traversal. Enqueue start node ${start} and mark as visited.`
  });

  while (queue.length > 0) {
    const current = queue.shift();

    steps.push({
      visited: Array.from(visited),
      queue: [...queue],
      currentNode: current,
      treeEdges: [...treeEdges],
      description: `Dequeue node ${current} for processing.`
    });

    const neighbors = adj[current].filter(n => !visited.has(n));
    neighbors.sort().forEach(neighbor => {
      visited.add(neighbor);
      queue.push(neighbor);
      treeEdges.push({ source: current, target: neighbor });
    });

    if (neighbors.length > 0) {
      steps.push({
        visited: Array.from(visited),
        queue: [...queue],
        currentNode: current,
        treeEdges: [...treeEdges],
        description: `Enqueue unvisited neighbors: ${neighbors.join(', ')} and mark them visited.`
      });
    }
  }

  steps.push({
    visited: Array.from(visited),
    queue: [],
    currentNode: null,
    treeEdges: [...treeEdges],
    description: "BFS traversal completed."
  });

  return steps;
}

/**
 * Topological Sort (using Kahn's algorithm)
 * @param {Array} nodes - list of node ids
 * @param {Array} edges - list of { source, target } (directed edges representing dependencies)
 */
export function topologicalSort(nodes, edges) {
  const steps = [];
  const inDegree = {};
  const adj = {};

  nodes.forEach(n => {
    inDegree[n] = 0;
    adj[n] = [];
  });

  edges.forEach(e => {
    adj[e.source].push(e.target);
    inDegree[e.target]++;
  });

  // Find all nodes with in-degree 0
  const queue = nodes.filter(n => inDegree[n] === 0).sort();
  const sortedOrder = [];

  steps.push({
    inDegrees: { ...inDegree },
    queue: [...queue],
    sortedOrder: [],
    currentNode: null,
    description: `Initialize Kahn's algorithm. Find nodes with in-degree 0: ${queue.join(', ')}`
  });

  while (queue.length > 0) {
    // Pop first
    const u = queue.shift();
    sortedOrder.push(u);

    steps.push({
      inDegrees: { ...inDegree },
      queue: [...queue],
      sortedOrder: [...sortedOrder],
      currentNode: u,
      description: `Process node ${u} (in-degree 0). Add to topological order.`
    });

    const neighbors = adj[u];
    neighbors.forEach(v => {
      inDegree[v]--;
      steps.push({
        inDegrees: { ...inDegree },
        queue: [...queue],
        sortedOrder: [...sortedOrder],
        currentNode: u,
        description: `Decrement in-degree of dependency ${v} to ${inDegree[v]}`
      });

      if (inDegree[v] === 0) {
        queue.push(v);
        steps.push({
          inDegrees: { ...inDegree },
          queue: [...queue],
          sortedOrder: [...sortedOrder],
          currentNode: u,
          description: `Dependency ${v} in-degree became 0. Add to queue.`
        });
      }
    });
  }

  steps.push({
    inDegrees: { ...inDegree },
    queue: [],
    sortedOrder: [...sortedOrder],
    currentNode: null,
    description: sortedOrder.length === nodes.length
      ? "Topological sort complete. No cycles detected."
      : "Cycle detected! Cannot perform complete topological sort on a cyclic graph."
  });

  return steps;
}
