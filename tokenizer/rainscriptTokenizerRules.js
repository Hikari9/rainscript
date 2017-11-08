/**
 * The tokenizer rules, ordered by priority. All tokenizer rules go here.
 *
 * tokenizerRules:
 *   {
 *     pattern: RegExp,
 *     type: any,
 *     start: Array<int>?
 *   }[]
 */
export const rainscriptTokenizerRules = [
  { pattern: /\[\[[^\]]*\]\]/, type: 'EVENT' },
  { pattern: /\s+/, type: 'WHITESPACE' }
];
