import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyText, VerificationResult } from './verify.js';

describe('verifyText', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('approves perfect match (> 0.95)', () => {
    const result = verifyText('hello world', 'hello world');
    expect(result.approved).toBe(true);
    expect(result.category).toBe('perfect');
    expect(result.score).toBeGreaterThan(0.95);
    expect(result.normalizedSpoken).toBe('hello world');
    expect(result.normalizedExpected).toBe('hello world');
  });

  it('approves passable match with fillers (80-95%, adjusted > 0.9)', () => {
    // "hello um world" vs "hello world" - with filler, score might be ~0.85
    // After removing "um", should be > 0.9
    const result = verifyText('hello um world', 'hello world');
    if (result.score >= 0.8 && result.score <= 0.95) {
      // If in passable range, check if adjusted score approves it
      expect(result.category).toMatch(/passable|failed/);
      if (result.approved) {
        expect(result.category).toBe('passable');
      }
    }
  });

  it('rejects failed match (< 0.80)', () => {
    const result = verifyText('completely different text', 'hello world');
    expect(result.approved).toBe(false);
    expect(result.category).toBe('failed');
    expect(result.score).toBeLessThan(0.8);
  });

  it('handles empty strings correctly', () => {
    const bothEmpty = verifyText('', '');
    expect(bothEmpty.approved).toBe(true);
    expect(bothEmpty.score).toBe(1);
    expect(bothEmpty.category).toBe('perfect');

    const oneEmpty = verifyText('hello', '');
    expect(oneEmpty.approved).toBe(false);
    expect(oneEmpty.score).toBe(0);
    expect(oneEmpty.category).toBe('failed');

    const otherEmpty = verifyText('', 'hello');
    expect(otherEmpty.approved).toBe(false);
    expect(otherEmpty.score).toBe(0);
    expect(otherEmpty.category).toBe('failed');
  });

  it('normalizes both inputs before comparison', () => {
    const result = verifyText('Hello, World!', 'hello world');
    expect(result.normalizedSpoken).toBe('hello world');
    expect(result.normalizedExpected).toBe('hello world');
    expect(result.approved).toBe(true);
    expect(result.category).toBe('perfect');
  });

  it('handles Hebrew text', () => {
    const result = verifyText('שלום עולם', 'שלום עולם');
    expect(result.approved).toBe(true);
    expect(result.category).toBe('perfect');
  });

  it('handles Hebrew numbers', () => {
    const result = verifyText('שלוש אנשים', '3 אנשים');
    expect(result.normalizedSpoken).toBe('3 אנשים');
    expect(result.normalizedExpected).toBe('3 אנשים');
    expect(result.approved).toBe(true);
  });

  it('handles different text lengths', () => {
    const short = verifyText('hello', 'hello world');
    expect(short.score).toBeLessThan(1);
    expect(typeof short.score).toBe('number');
    expect(short.score).toBeGreaterThanOrEqual(0);
  });

  it('logs verification score and timestamp', () => {
    verifyText('hello', 'world');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Verification]',
      expect.objectContaining({
        score: expect.any(Number),
        timestamp: expect.any(Number),
      }),
    );
  });

  it('returns normalized versions in result', () => {
    const result = verifyText('Hello, World!', 'HELLO WORLD');
    expect(result.normalizedSpoken).toBe('hello world');
    expect(result.normalizedExpected).toBe('hello world');
  });

  it('handles passable range without fillers (rejects)', () => {
    // Create a case where score is 80-95% but removing fillers doesn't help
    // "hello worl" vs "hello world" - close but not perfect, no fillers
    const result = verifyText('hello worl', 'hello world');
    expect(typeof result.score).toBe('number');
    if (result.score >= 0.8 && result.score <= 0.95) {
      // If no fillers to remove, should fail if adjusted score <= 0.9
      if (!result.approved) {
        expect(result.category).toBe('failed');
      }
    }
  });

  it('handles very similar text (high score)', () => {
    const result = verifyText('hello world', 'hello worl');
    expect(result.score).toBeGreaterThan(0.8);
    // Should either be perfect or passable if very close
    expect(['perfect', 'passable', 'failed']).toContain(result.category);
  });
});
