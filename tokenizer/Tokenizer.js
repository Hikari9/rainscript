import { _ } from 'underscore';
export class Tokenizer {
  /**
   * Creates a tokenizer from a given lexer.
   * @param {*} lexer the lexer to be used by the tokenizer
   */
  constructor (lexer) {
    if (_.isUndefined(lexer)) {
      throw new Error('argument mismatch, Tokenizer.constructor must have ' +
        'exactly one argument');
    }
    this.lexer = lexer;
  }

  /**
   * Returns a list of tokens from a given input text.
   * @param {String} text the text to tokenize
   */
  tokenize (text) {
    this.lexer.setInput(text);
    this.lexer.line = this.lexer.column = 1;
    let token;
    let tokens = [];
    while (!_.isUndefined(token = this.lexer.lex())) {
      tokens.push(token);
    }
    return tokens;
  }
}
