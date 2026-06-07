// src/algorithms/dp.js

/**
 * 0/1 Knapsack
 * @param {Array} items - Array of { name, cost, benefit, forceInclude, forceExclude }
 * @param {number} capacity - max budget capacity
 */
export function knapsack01(items, capacity) {
  const steps = [];
  const n = items.length;
  
  // dp[i][w] will store the maximum benefit with first i items and capacity w
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const computedCells = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(false));

  steps.push({
    dp: dp.map(row => [...row]),
    computedCells: computedCells.map(row => [...row]),
    itemIdx: 0,
    capIdx: 0,
    traceback: [],
    description: "Initialize Knapsack DP table with 0s."
  });

  // Solve DP
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (item.forceExclude) {
        // If forced to exclude, we just copy from previous row
        dp[i][w] = dp[i - 1][w];
        computedCells[i][w] = true;
        steps.push({
          dp: dp.map(row => [...row]),
          computedCells: computedCells.map(row => [...row]),
          itemIdx: i,
          capIdx: w,
          traceback: [],
          description: `Project '${item.name}' is force-excluded. Copying value from cell above: ${dp[i - 1][w]}`
        });
        continue;
      }

      // Check if forceInclude is active. If so, let's see if we can accommodate it.
      // Wait, forceInclude logic: we still run normal knapsack but we might bias selection.
      // Let's implement standard 0/1 Knapsack logic:
      if (item.cost <= w) {
        const excludeVal = dp[i - 1][w];
        const includeVal = dp[i - 1][w - item.cost] + item.benefit;

        // If forceInclude is active, we force selection of includeVal if possible, even if it's smaller,
        // or we just prefer it. Let's make it so forceInclude forces the selection.
        if (item.forceInclude) {
          dp[i][w] = includeVal;
        } else {
          dp[i][w] = Math.max(excludeVal, includeVal);
        }
        
        computedCells[i][w] = true;
        steps.push({
          dp: dp.map(row => [...row]),
          computedCells: computedCells.map(row => [...row]),
          itemIdx: i,
          capIdx: w,
          traceback: [],
          description: item.forceInclude
            ? `Project '${item.name}' is force-included. Take benefit ${includeVal} (remaining budget: ${w - item.cost}L)`
            : `Compare including '${item.name}' (benefit: ${includeVal}) vs excluding (benefit: ${excludeVal}). Take max: ${dp[i][w]}`
        });
      } else {
        if (item.forceInclude) {
          // Can't afford it even if force-included, so we exclude it (no choice)
          dp[i][w] = dp[i - 1][w];
        } else {
          dp[i][w] = dp[i - 1][w];
        }
        computedCells[i][w] = true;
        steps.push({
          dp: dp.map(row => [...row]),
          computedCells: computedCells.map(row => [...row]),
          itemIdx: i,
          capIdx: w,
          traceback: [],
          description: `Cannot afford '${item.name}' (Cost: ${item.cost}L > Budget: ${w}L). Value stays ${dp[i - 1][w]}`
        });
      }
    }
  }

  // Traceback to find selected items
  let w = capacity;
  const selectedItems = [];
  const tracebackCells = [];
  
  for (let i = n; i > 0; i--) {
    const item = items[i - 1];
    tracebackCells.push({ r: i, c: w });
    
    if (item.forceExclude) {
      // Exclude
      continue;
    }

    if (item.forceInclude && item.cost <= w) {
      selectedItems.push(item);
      w -= item.cost;
      steps.push({
        dp: dp.map(row => [...row]),
        computedCells: computedCells.map(row => [...row]),
        itemIdx: i,
        capIdx: w,
        traceback: [...tracebackCells],
        description: `Traceback: '${item.name}' was force-included. Move to budget capacity ${w}L.`
      });
    } else if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(item);
      w -= item.cost;
      steps.push({
        dp: dp.map(row => [...row]),
        computedCells: computedCells.map(row => [...row]),
        itemIdx: i,
        capIdx: w,
        traceback: [...tracebackCells],
        description: `Traceback: Value changed from ${dp[i - 1][w]} to ${dp[i][w]} at cell (${i}, ${w + item.cost}). Project '${item.name}' was selected. Move to budget capacity ${w}L.`
      });
    } else {
      steps.push({
        dp: dp.map(row => [...row]),
        computedCells: computedCells.map(row => [...row]),
        itemIdx: i,
        capIdx: w,
        traceback: [...tracebackCells],
        description: `Traceback: Value at (${i}, ${w}) is same as above (${i-1}, ${w}). Project '${item.name}' was not selected.`
      });
    }
  }

  tracebackCells.push({ r: 0, c: w });
  
  steps.push({
    dp: dp.map(row => [...row]),
    computedCells: computedCells.map(row => [...row]),
    itemIdx: 0,
    capIdx: w,
    traceback: [...tracebackCells],
    description: `Traceback complete. Total benefit: ${dp[n][capacity]}, budget utilized: ${capacity - w}L.`
  });

  return {
    steps,
    selectedItems,
    maxBenefit: dp[n][capacity]
  };
}

/**
 * Fractional Knapsack
 * @param {Array} items - Array of { name, cost, benefit, forceInclude, forceExclude }
 * @param {number} capacity - max budget capacity
 */
export function fractionalKnapsack(items, capacity) {
  const steps = [];
  const sortedItems = items
    .map((item, originalIdx) => ({
      ...item,
      originalIdx,
      ratio: item.benefit / item.cost
    }))
    .sort((a, b) => b.ratio - a.ratio);

  steps.push({
    sortedItems: sortedItems.map(it => ({ ...it })),
    capacity,
    currentBenefit: 0,
    selectedItems: [],
    currentItemIdx: -1,
    description: "Initialize Fractional Knapsack. Sort projects by benefit-to-cost ratio."
  });

  let remainingCap = capacity;
  let totalBenefit = 0;
  const selectedItems = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    
    if (item.forceExclude) {
      steps.push({
        sortedItems: sortedItems.map(it => ({ ...it })),
        capacity: remainingCap,
        currentBenefit: totalBenefit,
        selectedItems: [...selectedItems],
        currentItemIdx: i,
        description: `Project '${item.name}' is force-excluded. Skipping.`
      });
      continue;
    }

    if (remainingCap <= 0) {
      steps.push({
        sortedItems: sortedItems.map(it => ({ ...it })),
        capacity: remainingCap,
        currentBenefit: totalBenefit,
        selectedItems: [...selectedItems],
        currentItemIdx: i,
        description: `Capacity is fully utilized. Cannot add more projects.`
      });
      break;
    }

    steps.push({
      sortedItems: sortedItems.map(it => ({ ...it })),
      capacity: remainingCap,
      currentBenefit: totalBenefit,
      selectedItems: [...selectedItems],
      currentItemIdx: i,
      description: `Consider project '${item.name}' with ratio ${item.ratio.toFixed(2)}.`
    });

    if (item.cost <= remainingCap) {
      // Take whole
      remainingCap -= item.cost;
      totalBenefit += item.benefit;
      selectedItems.push({
        ...item,
        fraction: 1.0,
        allocatedCost: item.cost,
        allocatedBenefit: item.benefit
      });

      steps.push({
        sortedItems: sortedItems.map(it => ({ ...it })),
        capacity: remainingCap,
        currentBenefit: totalBenefit,
        selectedItems: [...selectedItems],
        currentItemIdx: i,
        description: `Take whole project '${item.name}'. Added benefit: ${item.benefit}, remaining budget: ${remainingCap}L.`
      });
    } else {
      // Take fraction
      const fraction = remainingCap / item.cost;
      const addedBenefit = item.benefit * fraction;
      totalBenefit += addedBenefit;
      selectedItems.push({
        ...item,
        fraction,
        allocatedCost: remainingCap,
        allocatedBenefit: addedBenefit
      });
      remainingCap = 0;

      steps.push({
        sortedItems: sortedItems.map(it => ({ ...it })),
        capacity: remainingCap,
        currentBenefit: totalBenefit,
        selectedItems: [...selectedItems],
        currentItemIdx: i,
        description: `Take fraction ${ (fraction * 100).toFixed(1) }% of project '${item.name}'. Added benefit: ${addedBenefit.toFixed(2)}, budget remaining: 0L.`
      });
      break;
    }
  }

  steps.push({
    sortedItems: sortedItems.map(it => ({ ...it })),
    capacity: remainingCap,
    currentBenefit: totalBenefit,
    selectedItems: [...selectedItems],
    currentItemIdx: sortedItems.length,
    description: `Fractional Knapsack complete. Total benefit: ${totalBenefit.toFixed(2)}`
  });

  return {
    steps,
    selectedItems,
    maxBenefit: totalBenefit
  };
}

/**
 * Binomial Coefficient C(n, k) using DP (Pascal's Triangle)
 */
export function binomialCoeff(n, k) {
  const steps = [];
  const dp = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= Math.min(i, k); j++) {
      if (j === 0 || j === i) {
        dp[i][j] = 1;
        steps.push({
          dp: dp.map(row => [...row]),
          i,
          j,
          description: `Base case: C(${i}, ${j}) = 1`
        });
      } else {
        dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
        steps.push({
          dp: dp.map(row => [...row]),
          i,
          j,
          description: `C(${i}, ${j}) = C(${i-1}, ${j-1}) [${dp[i-1][j-1]}] + C(${i-1}, ${j}) [${dp[i-1][j]}] = ${dp[i][j]}`
        });
      }
    }
  }

  return {
    table: dp,
    steps
  };
}

/**
 * Huffman Coding
 * @param {Array} frequencies - list of { name, count }
 */
export function huffmanCoding(frequencies) {
  const steps = [];
  
  // Create leaf nodes
  let nodes = frequencies.map(f => ({
    name: f.name,
    count: f.count,
    left: null,
    right: null,
    id: `leaf-${f.name}`
  }));

  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    description: "Create leaf nodes for each district based on frequencies."
  });

  let stepCount = 0;
  while (nodes.length > 1) {
    // Sort nodes by count ascending, then by name for stable sort
    nodes.sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      return (a.name || '').localeCompare(b.name || '');
    });

    const left = nodes[0];
    const right = nodes[1];

    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      selected: [left.id, right.id],
      description: `Select two nodes with smallest counts: '${left.name || 'internal'}' (${left.count}) and '${right.name || 'internal'}' (${right.count})`
    });

    // Merge nodes
    const parent = {
      name: null, // internal node
      count: left.count + right.count,
      left,
      right,
      id: `internal-${stepCount++}`
    };

    // Remove left and right, add parent
    nodes = nodes.slice(2);
    nodes.push(parent);

    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      selected: [parent.id],
      description: `Merge them into an internal node with count ${parent.count}`
    });
  }

  const root = nodes[0];
  const codes = {};

  function generateCodes(node, code) {
    if (!node) return;
    if (node.name) {
      codes[node.name] = code;
      return;
    }
    generateCodes(node.left, code + "0");
    generateCodes(node.right, code + "1");
  }

  generateCodes(root, "");

  steps.push({
    nodes: [root],
    codes,
    description: `Huffman tree construction complete. Generated codes: ${JSON.stringify(codes)}`
  });

  return {
    tree: root,
    codes,
    steps
  };
}
