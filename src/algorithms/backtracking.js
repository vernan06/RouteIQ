// src/algorithms/backtracking.js

/**
 * N-Queens Event Scheduler
 * Finds configurations of N events (queens) in an NxN schedule without conflicts
 * @param {number} n - board size (4 to 8)
 */
export function nQueens(n) {
  const steps = [];
  const board = Array(n).fill(-1); // board[row] = col of queen in that row
  let solutionsCount = 0;

  function isSafe(row, col, boardState) {
    const conflicts = [];
    let safe = true;
    for (let i = 0; i < row; i++) {
      const otherCol = boardState[i];
      if (otherCol === col) {
        conflicts.push({ r: i, c: otherCol });
        safe = false;
      }
      if (Math.abs(otherCol - col) === Math.abs(i - row)) {
        conflicts.push({ r: i, c: otherCol });
        safe = false;
      }
    }
    return { safe, conflicts };
  }

  function solve(row) {
    if (row === n) {
      solutionsCount++;
      steps.push({
        board: [...board],
        currentRow: row,
        placedAt: null,
        backtracked: false,
        conflictCells: [],
        description: `Solution #${solutionsCount} found! All events scheduled without conflicts.`,
        solutionsCount
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      board[row] = col;
      const { safe, conflicts } = isSafe(row, col, board);

      steps.push({
        board: [...board],
        currentRow: row,
        placedAt: { r: row, c: col },
        backtracked: false,
        conflictCells: conflicts,
        description: `Try scheduling event at Row ${row}, Col ${col}. ${safe ? 'No conflict.' : 'Conflict detected!'}`
      });

      if (safe) {
        solve(row + 1);
      }

      // Backtrack
      board[row] = -1;
      steps.push({
        board: [...board],
        currentRow: row,
        placedAt: null,
        backtracked: true,
        conflictCells: [],
        description: `Backtrack from Row ${row}, Col ${col}. Remove event.`
      });
    }
  }

  solve(0);
  return steps;
}

/**
 * Subset Sum Resource Matching
 * Find subsets of item costs that sum to the target grant budget
 * @param {Array} items - Array of numbers (costs)
 * @param {number} target - Target sum
 */
export function subsetSum(items, target) {
  const steps = [];
  const currentSubset = [];
  const validSubsets = [];

  function solve(index, currentSum) {
    steps.push({
      currentSubset: [...currentSubset],
      sum: currentSum,
      action: 'check',
      description: `Check state. Current subset sum is ₹${currentSum}L (Target: ₹${target}L)`
    });

    if (currentSum === target) {
      validSubsets.push([...currentSubset]);
      steps.push({
        currentSubset: [...currentSubset],
        sum: currentSum,
        action: 'found',
        description: `Valid budget allocation found: [${currentSubset.map(idx => `Project ${idx + 1} (₹${items[idx]}L)`).join(', ')}] = ₹${target}L!`
      });
      return;
    }

    if (currentSum > target || index >= items.length) {
      steps.push({
        currentSubset: [...currentSubset],
        sum: currentSum,
        action: 'backtrack',
        description: currentSum > target
          ? `Exceeded budget limit (₹${currentSum}L > ₹${target}L). Backtracking.`
          : `End of projects list reached without matching target. Backtracking.`
      });
      return;
    }

    // Option 1: Include item at index
    currentSubset.push(index);
    steps.push({
      currentSubset: [...currentSubset],
      sum: currentSum + items[index],
      action: 'include',
      description: `Include Project ${index + 1} (₹${items[index]}L) in the matching set.`
    });
    solve(index + 1, currentSum + items[index]);

    // Option 2: Exclude item at index
    currentSubset.pop();
    steps.push({
      currentSubset: [...currentSubset],
      sum: currentSum,
      action: 'exclude',
      description: `Exclude Project ${index + 1} (₹${items[index]}L) and try next.`
    });
    solve(index + 1, currentSum);
  }

  solve(0, 0);
  return { steps, validSubsets };
}

/**
 * Branch and Bound TSP (Traveling Salesperson Problem)
 * Finds the shortest patrol route visiting 6 fire stations
 * @param {Array} distMatrix - 6x6 distance matrix
 */
export function tspBranchBound(distMatrix) {
  const steps = [];
  const n = distMatrix.length;
  let bestCost = Infinity;
  let bestPath = [];

  // Initial lower bound calculation
  function calculateBound(path) {
    let bound = 0;
    // Simple bound: current path cost + minimum outgoing edge for remaining unvisited nodes
    let pathCost = 0;
    const visited = new Set(path);

    for (let i = 0; i < path.length - 1; i++) {
      pathCost += distMatrix[path[i]][path[i + 1]];
    }

    bound += pathCost;

    // Estimate for unvisited nodes
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) || i === path[path.length - 1]) {
        // Find min edge outgoing from i
        let minEdge = Infinity;
        for (let j = 0; j < n; j++) {
          if (i !== j && (!visited.has(j) || j === path[0])) {
            minEdge = Math.min(minEdge, distMatrix[i][j]);
          }
        }
        if (minEdge !== Infinity) bound += minEdge;
      }
    }
    return { bound, pathCost };
  }

  function solve(path) {
    const { bound, pathCost } = calculateBound(path);

    if (bound >= bestCost) {
      steps.push({
        currentPath: [...path],
        bound,
        bestCost,
        prunedAt: path[path.length - 1],
        description: `Pruned path [${path.join(' → ')}]. Bound (${bound.toFixed(1)} km) >= Current Best (${bestCost.toFixed(1)} km)`
      });
      return;
    }

    if (path.length === n) {
      // Complete path, add return link to start
      const finalCost = pathCost + distMatrix[path[n - 1]][path[0]];
      const fullPath = [...path, path[0]];
      if (finalCost < bestCost) {
        bestCost = finalCost;
        bestPath = fullPath;
        steps.push({
          currentPath: fullPath,
          bound: finalCost,
          bestCost,
          prunedAt: null,
          description: `New best patrol route found! Cost: ${bestCost.toFixed(1)} km: [${fullPath.join(' → ')}]`
        });
      } else {
        steps.push({
          currentPath: fullPath,
          bound: finalCost,
          bestCost,
          prunedAt: null,
          description: `Complete route cost (${finalCost.toFixed(1)} km) is not better than best (${bestCost.toFixed(1)} km).`
        });
      }
      return;
    }

    steps.push({
      currentPath: [...path],
      bound,
      bestCost,
      prunedAt: null,
      description: `Expand path [${path.join(' → ')}]. Current bound: ${bound.toFixed(1)} km.`
    });

    for (let next = 0; next < n; next++) {
      if (!path.includes(next)) {
        solve([...path, next]);
      }
    }
  }

  solve([0]);
  
  steps.push({
    currentPath: bestPath,
    bound: bestCost,
    bestCost,
    prunedAt: null,
    description: `Branch & Bound TSP finished. Best route: [${bestPath.join(' → ')}] with cost ${bestCost.toFixed(1)} km.`
  });

  return steps;
}

/**
 * Assignment Problem (Shift Assignment using Branch & Bound)
 * Matches 5 workers to 5 shifts with minimal cost
 * @param {Array} costMatrix - 5x5 cost matrix representing shift costs for workers
 */
export function assignmentProblem(costMatrix) {
  const steps = [];
  const n = costMatrix.length;
  let bestCost = Infinity;
  let bestAssignment = [];

  // Simple lower bound: cost of already assigned + min cost in remaining rows
  function getBound(assigned) {
    let cost = 0;
    const workerSet = new Set(assigned);

    for (let workerIdx = 0; workerIdx < assigned.length; workerIdx++) {
      const shiftIdx = assigned[workerIdx];
      cost += costMatrix[workerIdx][shiftIdx];
    }

    let bound = cost;
    for (let workerIdx = assigned.length; workerIdx < n; workerIdx++) {
      let minRowCost = Infinity;
      for (let shiftIdx = 0; shiftIdx < n; shiftIdx++) {
        if (!workerSet.has(shiftIdx)) {
          minRowCost = Math.min(minRowCost, costMatrix[workerIdx][shiftIdx]);
        }
      }
      if (minRowCost !== Infinity) bound += minRowCost;
    }
    return bound;
  }

  function solve(assigned) {
    const currentWorker = assigned.length;
    const bound = getBound(assigned);

    if (bound >= bestCost) {
      steps.push({
        currentMatching: [...assigned],
        cost: getBound(assigned), // approximate cost
        bestCost,
        bound,
        description: `Prune branch. Bound (${bound}) >= Current Best cost (${bestCost})`
      });
      return;
    }

    if (currentWorker === n) {
      let finalCost = 0;
      for (let i = 0; i < n; i++) finalCost += costMatrix[i][assigned[i]];

      if (finalCost < bestCost) {
        bestCost = finalCost;
        bestAssignment = [...assigned];
        steps.push({
          currentMatching: [...assigned],
          cost: finalCost,
          bestCost,
          bound: finalCost,
          description: `New optimal shift assignment found! Total Cost: ${bestCost}.`
        });
      }
      return;
    }

    steps.push({
      currentMatching: [...assigned],
      cost: getBound(assigned),
      bestCost,
      bound,
      description: `Assign Worker ${currentWorker + 1}. Current bound: ${bound}`
    });

    for (let shift = 0; shift < n; shift++) {
      if (!assigned.includes(shift)) {
        solve([...assigned, shift]);
      }
    }
  }

  solve([]);

  steps.push({
    currentMatching: bestAssignment,
    cost: bestCost,
    bestCost,
    bound: bestCost,
    description: `Assignment Complete. Optimal Shift Assignment: [${bestAssignment.map((shift, worker) => `W${worker+1}→S${shift+1}`).join(', ')}] with total cost ${bestCost}`
  });

  return { steps, bestAssignment, bestCost };
}
