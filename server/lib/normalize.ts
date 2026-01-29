/**
 * Text normalization for rehearsal verification.
 * Normalizes both STT output and script lines before comparison.
 */

const HEBREW_NUMBERS: Record<string, string> = {
  אחת: '1',
  אחד: '1',
  שתיים: '2',
  שניים: '2',
  שלוש: '3',
  שלושה: '3',
  ארבע: '4',
  ארבעה: '4',
  חמש: '5',
  חמישה: '5',
  שש: '6',
  שישה: '6',
  שבע: '7',
  שבעה: '7',
  שמונה: '8',
  תשע: '9',
  תשעה: '9',
  עשר: '10',
  עשרה: '10',
};

export const FILLER_WORDS = [
  'אה',
  'אמ',
  'כאילו',
  'נו',
  'אז',
  'um',
  'uh',
  'like',
  'so',
  'well',
];

/**
 * Normalizes text for comparison:
 * 1. Lowercase
 * 2. Trim
 * 3. Remove punctuation
 * 4. Normalize whitespace
 * 5. Convert Hebrew number words to digits
 */
export function normalizeText(text: string): string {
  let normalized = text
    .toLowerCase()
    .trim()
    // Remove punctuation
    .replace(/[.,!?;:'"()\-–—]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');

  // Convert Hebrew number words to digits
  for (const [word, digit] of Object.entries(HEBREW_NUMBERS)) {
    normalized = normalized.replace(new RegExp(word, 'g'), digit);
  }

  return normalized;
}

/**
 * Removes filler words from normalized text.
 * Used for passable range (80-95%) to check if difference is just fillers.
 * Handles both Hebrew (no word boundaries) and English (word boundaries).
 */
export function removeFillersFromSpoken(text: string): string {
  // Match filler words at start, end, or surrounded by spaces
  // For Hebrew: match at start/end or with spaces (no \b needed)
  // For English: use word boundaries
  const escapedFillers = FILLER_WORDS.map((f) =>
    f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  // Pattern: start of string OR space before, filler word, space after OR end of string
  const pattern = new RegExp(
    `(^|\\s)(${escapedFillers.join('|')})(?=\\s|$)`,
    'gi',
  );
  let result = text.replace(pattern, '');
  // Clean up any double spaces left
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}
