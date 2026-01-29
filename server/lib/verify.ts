/**
 * Text verification using Levenshtein distance.
 * Compares normalized spoken text to expected script line.
 */
import { get } from 'fast-levenshtein';
import { normalizeText, removeFillersFromSpoken } from './normalize.js';
import {
  VERIFICATION_THRESHOLD_PERFECT,
  VERIFICATION_THRESHOLD_PASSABLE,
} from '../../shared/constants.js';

export interface VerificationResult {
  approved: boolean;
  score: number;
  category: 'perfect' | 'passable' | 'failed';
  normalizedSpoken: string;
  normalizedExpected: string;
}

/**
 * Verifies spoken text against expected script line.
 * Returns approval status, similarity score, and normalized versions.
 */
export function verifyText(
  spoken: string,
  expected: string,
): VerificationResult {
  const normalizedSpoken = normalizeText(spoken);
  const normalizedExpected = normalizeText(expected);

  // Calculate similarity
  const maxLen = Math.max(normalizedSpoken.length, normalizedExpected.length);
  let score: number;

  if (maxLen === 0) {
    score = 1; // Both empty = perfect match
  } else if (normalizedSpoken.length === 0 || normalizedExpected.length === 0) {
    score = 0; // One empty = no match
  } else {
    const distance = get(normalizedSpoken, normalizedExpected);
    score = 1 - distance / maxLen;
  }

  // Log for calibration (PRD 8.2) - no audio/text, only score + timestamp
  console.log('[Verification]', {
    score,
    timestamp: Date.now(),
  });

  // Perfect match (> 0.95)
  if (score > VERIFICATION_THRESHOLD_PERFECT) {
    return {
      approved: true,
      score,
      category: 'perfect',
      normalizedSpoken,
      normalizedExpected,
    };
  }

  // Passable range (0.80 - 0.95) - check if difference is just fillers
  if (score >= VERIFICATION_THRESHOLD_PASSABLE) {
    const withoutFillers = removeFillersFromSpoken(normalizedSpoken);
    const fillerFreeMaxLen = Math.max(
      withoutFillers.length,
      normalizedExpected.length,
    );
    let adjustedScore: number;

    if (fillerFreeMaxLen === 0) {
      adjustedScore = 1;
    } else if (withoutFillers.length === 0 || normalizedExpected.length === 0) {
      adjustedScore = 0;
    } else {
      const fillerFreeDistance = get(withoutFillers, normalizedExpected);
      adjustedScore = 1 - fillerFreeDistance / fillerFreeMaxLen;
    }

    // If adjusted score > 0.9, approve as passable
    if (adjustedScore > 0.9) {
      return {
        approved: true,
        score: adjustedScore,
        category: 'passable',
        normalizedSpoken,
        normalizedExpected,
      };
    }
  }

  // Failed (< 0.80 or passable but adjusted score ≤ 0.9)
  return {
    approved: false,
    score,
    category: 'failed',
    normalizedSpoken,
    normalizedExpected,
  };
}
