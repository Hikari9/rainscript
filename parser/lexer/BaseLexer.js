import Lexer from 'lex';
import { _ } from 'underscore';
const ccount = require('ccount');

export class BaseLexer extends Lexer {
  /**
   * Constructs a Lexer that tokenizes rules along with a line number
   * and column index.
   * @param {Function} defunct the default behavior when an unknown character
   *                           token is lexed
   */
  constructor (defunct) {
    // hook line / column increment even for unknown characters
    super((character) => {
      if (character === '\n') {
        this.line += 1;
        this.column = 1;
      } else {
        this.column += 1;
      }
      return defunct(character);
    });
    // log the line and column number
    this.line = 1;
    this.column = 1;

    // rename addRule method set by lex package, prefer prototype from below
    this._addRule = this.addRule;
    delete this.addRule;
  }

  /**
   * Add a new regex-based rule for this lexer with a specified token.
   * @param {RegExp}      pattern   the regex rule
   * @param {*|Function}  tokenType the token type that describes this rule, can
   *                                be a callback function
   * @param {Array<int>?} start     start conditions for this rule, used by
   *                                lexer flex
   */
  addRule (pattern, tokenType, start) {
    if (!(pattern instanceof RegExp)) {
      throw new Error('Argument mismatch, pattern must be a regular expression');
    }
    return this._addRule(pattern, (lexeme) => {
      // update line / column count
      let line = this.line;
      let column = this.column;
      let lines = ccount(lexeme, '\n');
      if (lines > 0) {
        this.line += lines;
        this.column = lexeme.length - lexeme.lastIndexOf('\n');
      } else {
        this.column += lexeme.length;
      }
      // create method for tokenizing (since we might map an array)
      let tokenize = (tokenType) => {
        if (_.isUndefined(tokenType)) {
          return undefined;
        }
        return {
          token: tokenType,
          lexeme: lexeme,
          line: line,
          column: column
        };
      };
      // receive actual token from argument or callback
      let tokenTypes = tokenType instanceof Function
        ? tokenType(lexeme) // get token from callback
        : tokenType; // get token as-is
      return tokenTypes instanceof Array
        ? tokenTypes.map(tokenize)
        : tokenize(tokenTypes);
    }, start);
  }
}
