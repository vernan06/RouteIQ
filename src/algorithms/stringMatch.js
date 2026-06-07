// src/algorithms/stringMatch.js

/**
 * Naive String Search
 * @param {string} text - text to search in
 * @param {string} pattern - pattern to search for
 */
export function naiveSearch(text, pattern) {
  const steps = [];
  const n = text.length;
  const m = pattern.length;

  if (m === 0 || n < m) return [];

  steps.push({
    position: 0,
    comparing: [],
    skip: 0,
    matched: [],
    description: `Initialize Naive Search. Text length: ${n}, Pattern length: ${m}.`
  });

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    const comparing = [];
    
    steps.push({
      position: i,
      comparing: [],
      skip: 0,
      matched: [],
      description: `Align pattern at text position ${i}.`
    });

    while (j < m) {
      comparing.push({ textIdx: i + j, patIdx: j });
      const isMatch = text[i + j] === pattern[j];
      
      steps.push({
        position: i,
        comparing: [...comparing],
        skip: 0,
        matched: Array.from({ length: j }, (_, k) => i + k),
        description: `Compare: Text '${text[i+j]}' vs Pattern '${pattern[j]}' at pattern index ${j}. ${isMatch ? 'Match!' : 'Mismatch!'}`
      });

      if (!isMatch) {
        break;
      }
      j++;
    }

    if (j === m) {
      steps.push({
        position: i,
        comparing: [],
        skip: 1,
        matched: Array.from({ length: m }, (_, k) => i + k),
        description: `Full match found at index ${i}!`
      });
    }
  }

  return steps;
}

/**
 * Horspool's Algorithm
 */
export function horspool(text, pattern) {
  const steps = [];
  const n = text.length;
  const m = pattern.length;

  // Build Shift Table (Bad Character Table for Horspool)
  const shiftTable = {};
  // Default shift is pattern length m
  for (let i = 0; i < 256; i++) {
    shiftTable[String.fromCharCode(i)] = m;
  }
  // For characters in pattern (excluding last character)
  for (let i = 0; i < m - 1; i++) {
    shiftTable[pattern[i]] = m - 1 - i;
  }

  // Filter shift table to only show characters in pattern for display
  const displayShiftTable = {};
  for (let i = 0; i < m; i++) {
    displayShiftTable[pattern[i]] = shiftTable[pattern[i]];
  }
  displayShiftTable['others'] = m;

  steps.push({
    position: 0,
    comparing: [],
    skip: 0,
    matched: [],
    shiftTable: displayShiftTable,
    description: `Pre-processing: Build Horspool Shift Table. Shift = pattern length (${m}) minus character index.`
  });

  let i = 0;
  while (i <= n - m) {
    let j = m - 1;
    const comparing = [];

    steps.push({
      position: i,
      comparing: [],
      skip: 0,
      matched: [],
      shiftTable: displayShiftTable,
      description: `Align pattern at index ${i}. Compare from right to left.`
    });

    while (j >= 0) {
      comparing.push({ textIdx: i + j, patIdx: j });
      const isMatch = text[i + j] === pattern[j];

      steps.push({
        position: i,
        comparing: [...comparing],
        skip: 0,
        matched: Array.from({ length: m - 1 - j }, (_, k) => i + m - 1 - k),
        shiftTable: displayShiftTable,
        description: `Compare from right: Text '${text[i+j]}' vs Pattern '${pattern[j]}' at index ${j}. ${isMatch ? 'Match!' : 'Mismatch!'}`
      });

      if (!isMatch) {
        break;
      }
      j--;
    }

    const alignedChar = text[i + m - 1];
    const shift = shiftTable[alignedChar] || m;

    if (j < 0) {
      steps.push({
        position: i,
        comparing: [],
        skip: shift,
        matched: Array.from({ length: m }, (_, k) => i + k),
        shiftTable: displayShiftTable,
        description: `Full match found at index ${i}! Shift pattern by ${shift} (determined by text char '${alignedChar}' aligned with end of pattern).`
      });
      i += shift;
    } else {
      steps.push({
        position: i,
        comparing: [],
        skip: shift,
        matched: [],
        shiftTable: displayShiftTable,
        description: `Mismatch. Shift pattern by ${shift} (determined by text char '${alignedChar}' aligned with end of pattern).`
      });
      i += shift;
    }
  }

  return { shiftTable: displayShiftTable, steps };
}

/**
 * Boyer-Moore Algorithm (combines Bad Character + Good Suffix)
 */
export function boyerMoore(text, pattern) {
  const steps = [];
  const n = text.length;
  const m = pattern.length;

  if (m === 0) return [];

  // 1. Bad Character Heuristic
  const badChar = {};
  for (let i = 0; i < 256; i++) {
    badChar[String.fromCharCode(i)] = -1;
  }
  for (let i = 0; i < m; i++) {
    badChar[pattern[i]] = i;
  }

  const displayBadChar = {};
  for (let i = 0; i < m; i++) {
    displayBadChar[pattern[i]] = badChar[pattern[i]];
  }
  displayBadChar['others'] = -1;

  // 2. Good Suffix Heuristic
  const suffix = Array(m).fill(0);
  const goodSuffix = Array(m).fill(m); // default shift is m

  // Find suffixes
  for (let i = m - 2; i >= 0; i--) {
    let len = 0;
    while (i - len >= 0 && pattern[i - len] === pattern[m - 1 - len]) {
      len++;
    }
    suffix[i] = len;
  }

  // Case 1: Substring matches suffix
  let lastPrefixPosition = m;
  for (let i = m - 1; i >= -1; i--) {
    if (i === -1 || suffix[i] === i + 1) {
      lastPrefixPosition = i + 1;
    }
    goodSuffix[i + 1] = lastPrefixPosition - i + m - 1;
  }

  // Case 2: Suffix matches prefix
  for (let i = 0; i < m - 1; i++) {
    goodSuffix[m - 1 - suffix[i]] = m - 1 - i + m - 1 - suffix[i];
  }

  const goodSuffixDisplay = goodSuffix.map((val, idx) => ({ index: idx, shift: val }));

  steps.push({
    position: 0,
    comparing: [],
    skip: 0,
    matched: [],
    badChar: displayBadChar,
    goodSuffix: goodSuffixDisplay,
    description: "Pre-processing: Build Boyer-Moore Bad Character and Good Suffix tables."
  });

  let s = 0; // shift of the pattern with respect to text
  while (s <= n - m) {
    let j = m - 1;
    const comparing = [];

    steps.push({
      position: s,
      comparing: [],
      skip: 0,
      matched: [],
      badChar: displayBadChar,
      goodSuffix: goodSuffixDisplay,
      description: `Align pattern at index ${s}. Compare right-to-left.`
    });

    while (j >= 0) {
      comparing.push({ textIdx: s + j, patIdx: j });
      const isMatch = text[s + j] === pattern[j];

      steps.push({
        position: s,
        comparing: [...comparing],
        skip: 0,
        matched: Array.from({ length: m - 1 - j }, (_, k) => s + m - 1 - k),
        badChar: displayBadChar,
        goodSuffix: goodSuffixDisplay,
        description: `Compare from right: Text '${text[s+j]}' vs Pattern '${pattern[j]}' at index ${j}. ${isMatch ? 'Match!' : 'Mismatch!'}`
      });

      if (!isMatch) {
        break;
      }
      j--;
    }

    if (j < 0) {
      // Match found
      const badCharShift = (s + m < n) ? m - badChar[text[s + m]] : 1;
      const goodSuffixShift = goodSuffix[0];
      const actualShift = Math.max(badCharShift, goodSuffixShift);

      steps.push({
        position: s,
        comparing: [],
        skip: actualShift,
        matched: Array.from({ length: m }, (_, k) => s + k),
        badChar: displayBadChar,
        goodSuffix: goodSuffixDisplay,
        description: `Full match found at index ${s}! Bad-char shift: ${badCharShift}, Good-suffix shift: ${goodSuffixShift}. Shift pattern by max: ${actualShift}.`
      });
      s += actualShift;
    } else {
      // Mismatch
      const mismatchedChar = text[s + j];
      const badCharShift = Math.max(1, j - badChar[mismatchedChar]);
      const goodSuffixShift = goodSuffix[j + 1];
      const actualShift = Math.max(badCharShift, goodSuffixShift);

      steps.push({
        position: s,
        comparing: [],
        skip: actualShift,
        matched: [],
        badChar: displayBadChar,
        goodSuffix: goodSuffixDisplay,
        description: `Mismatch at text '${mismatchedChar}' & pattern index ${j}. Bad-char shift: ${badCharShift}, Good-suffix shift: ${goodSuffixShift}. Shift pattern by max: ${actualShift}.`
      });
      s += actualShift;
    }
  }

  return steps;
}
