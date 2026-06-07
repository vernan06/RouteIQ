// src/algorithms/sorting.js

/**
 * Returns steps for Bubble Sort.
 * Each step: { array, comparing, swapping, sorted, description }
 */
export function bubbleSort(originalArr) {
  const steps = [];
  const arr = [...originalArr];
  const n = arr.length;
  const sortedIndices = [];

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Initialize Bubble Sort"
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sortedIndices],
        description: `Compare element at index ${j} (${arr[j].toFixed(1)}) and index ${j+1} (${arr[j+1].toFixed(1)})`
      });

      if (arr[j] > arr[j + 1]) {
        // Swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sortedIndices],
          description: `Swap element at index ${j} and index ${j+1}`
        });
      }
    }
    sortedIndices.unshift(n - i - 1);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sortedIndices],
      description: `Element at index ${n - i - 1} is in its final sorted position`
    });
  }
  sortedIndices.unshift(0);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sortedIndices],
    description: "Sorting complete"
  });

  return steps;
}

/**
 * Selection Sort
 */
export function selectionSort(originalArr) {
  const steps = [];
  const arr = [...originalArr];
  const n = arr.length;
  const sortedIndices = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Initialize Selection Sort"
  });

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sortedIndices],
        description: `Scan elements: check if index ${j} (${arr[j].toFixed(1)}) is smaller than current minimum at index ${minIdx} (${arr[minIdx].toFixed(1)})`
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...arr],
          comparing: [minIdx],
          swapping: [],
          sorted: [...sortedIndices],
          description: `New minimum found at index ${minIdx} (${arr[minIdx].toFixed(1)})`
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sortedIndices],
        description: `Swap index ${i} and minimum index ${minIdx}`
      });
    }

    sortedIndices.push(i);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sortedIndices],
      description: `Element at index ${i} is sorted`
    });
  }

  return steps;
}

/**
 * Insertion Sort
 */
export function insertionSort(originalArr) {
  const steps = [];
  const arr = [...originalArr];
  const n = arr.length;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [0],
    description: "Initialize Insertion Sort. First element is trivially sorted."
  });

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: Array.from({ length: i }, (_, k) => k),
      description: `Select key ${key.toFixed(1)} at index ${i}`
    });

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => k),
        description: `Compare index ${j} (${arr[j].toFixed(1)}) with key (${key.toFixed(1)})`
      });

      arr[j + 1] = arr[j];
      j--;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j + 1, j + 2],
        sorted: Array.from({ length: i }, (_, k) => k),
        description: `Shift element at index ${j + 2} to index ${j + 1}`
      });
    }
    arr[j + 1] = key;
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [j + 1],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      description: `Insert key at index ${j + 1}`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    description: "Sorting complete"
  });

  return steps;
}

/**
 * Merge Sort
 */
export function mergeSort(originalArr) {
  const steps = [];
  const arr = [...originalArr];
  const n = arr.length;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Initialize Merge Sort"
  });

  function merge(l, m, r) {
    const temp = [];
    let i = l, j = m + 1;

    while (i <= m && j <= r) {
      steps.push({
        array: [...arr],
        comparing: [i, j],
        swapping: [],
        sorted: [],
        description: `Compare elements at index ${i} (${arr[i].toFixed(1)}) and ${j} (${arr[j].toFixed(1)})`
      });

      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }

    while (i <= m) {
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        description: `Take remaining element from left side at index ${i}`
      });
      temp.push(arr[i++]);
    }

    while (j <= r) {
      steps.push({
        array: [...arr],
        comparing: [j],
        swapping: [],
        sorted: [],
        description: `Take remaining element from right side at index ${j}`
      });
      temp.push(arr[j++]);
    }

    for (let k = 0; k < temp.length; k++) {
      arr[l + k] = temp[k];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [l + k],
        sorted: [],
        description: `Place merged element at index ${l + k}`
      });
    }
  }

  function mergeSortHelper(l, r) {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      mergeSortHelper(l, m);
      mergeSortHelper(m + 1, r);
      merge(l, m, r);
    }
  }

  mergeSortHelper(0, n - 1);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    description: "Sorting complete"
  });

  return steps;
}

/**
 * Quick Sort
 */
export function quickSort(originalArr) {
  const steps = [];
  const arr = [...originalArr];
  const n = arr.length;
  const sortedIndices = new Set();

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    description: "Initialize Quick Sort"
  });

  function partition(low, high) {
    let pivot = arr[high];
    steps.push({
      array: [...arr],
      comparing: [high],
      swapping: [],
      sorted: Array.from(sortedIndices),
      description: `Select pivot ${pivot.toFixed(1)} at index ${high}`
    });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        sorted: Array.from(sortedIndices),
        description: `Compare index ${j} (${arr[j].toFixed(1)}) with pivot (${pivot.toFixed(1)})`
      });

      if (arr[j] < pivot) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, j],
          sorted: Array.from(sortedIndices),
          description: `Swap index ${i} and index ${j} (element is less than pivot)`
        });
      }
    }

    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i + 1, high],
      sorted: Array.from(sortedIndices),
      description: `Swap pivot to its correct position at index ${i + 1}`
    });

    return i + 1;
  }

  function quickSortHelper(low, high) {
    if (low <= high) {
      if (low === high) {
        sortedIndices.add(low);
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: Array.from(sortedIndices),
          description: `Index ${low} is trivially sorted`
        });
        return;
      }
      let pi = partition(low, high);
      sortedIndices.add(pi);
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: Array.from(sortedIndices),
        description: `Pivot at index ${pi} is sorted`
      });

      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  }

  quickSortHelper(0, n - 1);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, k) => k),
    description: "Sorting complete"
  });

  return steps;
}
