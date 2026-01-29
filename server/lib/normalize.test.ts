import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  removeFillersFromSpoken,
  FILLER_WORDS,
} from './normalize.js';

describe('normalizeText', () => {
  it('removes punctuation', () => {
    expect(normalizeText('Hello, world!')).toBe('hello world');
    expect(normalizeText('What? Yes.')).toBe('what yes');
    expect(normalizeText('Test: "quotes"')).toBe('test quotes');
    expect(normalizeText('(parentheses)')).toBe('parentheses');
  });

  it('converts to lowercase', () => {
    expect(normalizeText('HELLO WORLD')).toBe('hello world');
    expect(normalizeText('MiXeD CaSe')).toBe('mixed case');
  });

  it('normalizes whitespace', () => {
    expect(normalizeText('hello   world')).toBe('hello world');
    expect(normalizeText('  hello  world  ')).toBe('hello world');
    expect(normalizeText('hello\t\nworld')).toBe('hello world');
  });

  it('converts Hebrew number words to digits', () => {
    expect(normalizeText('שלוש')).toBe('3');
    expect(normalizeText('אחת שתיים שלוש')).toBe('1 2 3');
    expect(normalizeText('חמש אנשים')).toBe('5 אנשים');
    expect(normalizeText('עשר שנים')).toBe('10 שנים');
  });

  it('handles mixed Hebrew and English', () => {
    expect(normalizeText('שלוש apples')).toBe('3 apples');
    expect(normalizeText('Hello שלוש world')).toBe('hello 3 world');
  });

  it('handles empty string', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('   ')).toBe('');
  });

  it('handles text with only punctuation', () => {
    expect(normalizeText('!!!')).toBe('');
    expect(normalizeText('...')).toBe('');
  });
});

describe('removeFillersFromSpoken', () => {
  it('removes Hebrew filler words', () => {
    expect(removeFillersFromSpoken('אה שלום')).toBe('שלום');
    expect(removeFillersFromSpoken('כאילו זה טוב')).toBe('זה טוב');
    expect(removeFillersFromSpoken('נו אז בוא')).toBe('בוא');
  });

  it('removes English filler words', () => {
    expect(removeFillersFromSpoken('um hello')).toBe('hello');
    expect(removeFillersFromSpoken('uh well so')).toBe('');
    expect(removeFillersFromSpoken('like you know')).toBe('you know');
  });

  it('removes fillers with word boundaries', () => {
    expect(removeFillersFromSpoken('hello um world')).toBe('hello world');
    expect(removeFillersFromSpoken('umhello')).toBe('umhello'); // Not removed (no boundary)
  });

  it('normalizes whitespace after removing fillers', () => {
    expect(removeFillersFromSpoken('hello  um  world')).toBe('hello world');
    expect(removeFillersFromSpoken('um  uh  like')).toBe('');
  });

  it('handles case-insensitive filler removal', () => {
    expect(removeFillersFromSpoken('UM hello')).toBe('hello');
    expect(removeFillersFromSpoken('Like So')).toBe('');
  });

  it('handles empty string', () => {
    expect(removeFillersFromSpoken('')).toBe('');
    expect(removeFillersFromSpoken('um uh')).toBe('');
  });
});

describe('FILLER_WORDS constant', () => {
  it('contains expected filler words', () => {
    expect(FILLER_WORDS).toContain('אה');
    expect(FILLER_WORDS).toContain('כאילו');
    expect(FILLER_WORDS).toContain('um');
    expect(FILLER_WORDS).toContain('uh');
    expect(FILLER_WORDS).toContain('like');
  });
});
