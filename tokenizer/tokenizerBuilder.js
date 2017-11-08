import { Tokenizer } from './Tokenizer';
import Lexer from 'lex';
import { _ } from 'underscore';
const ccount = require('ccount');

/**
 * A Tokenizer builder that organizes additions of lexer rulesets. Note that
 * this method can only build one tokenizer instance at a time.
 */
export const tokenizerBuilder = () => {
  let rules = [];
  let defaults = [];
  let built = false;
  let lexer;
  return {
    /**
     * Adds a new default rule when no pattern matches a specific character.
     * @param {*} type
     * @returns this tokenizer builder instance
     */
    defaultRule (tokenType) {
      confirmBuildStatus('cannot add new default rule');
      defaults.push(lexemeRequest(tokenType));
      return this;
    },

    /**
     * Add a new rule that ignores or skips a regex-based pattern.
     * @param {RegExp} pattern the regex rule
     * @returns this tokenizer builder instance
     */
    ignoreRule (pattern) {
      confirmBuildStatus('cannot add new ignore rule');
      if (!(pattern instanceof RegExp)) {
        throw new Error('argument mismatch, pattern must be an instance of ' +
          'RegExp');
      }
      rules.push({
        pattern: pattern,
        action: lexemeRequest(undefined),
        start: undefined
      });
      return this;
    },

    /**
     * Add a new regex-based rule associated with a specified token type.
     * @param {RegExp} pattern   the regex rule
     * @param {*}      tokenType the type of the token that describes this rule,
     *                           can be a callback function
     * @param {*}      start     start conditions for the lexer
     * @returns this tokenizer builder instance
     */
    addRule (pattern, tokenType, start) {
      confirmBuildStatus('cannot add new rule');
      if (!(pattern instanceof RegExp)) {
        throw new Error('argument mismatch, pattern must be an instance of ' +
          'RegExp');
      }
      if (_.isUndefined(tokenType)) {
        throw new Error('argument mismatch, tokenType must be defined');
      }
      rules.push({
        pattern: pattern,
        action: lexemeRequest(tokenType),
        start: start
      });
      return this;
    },

    /**
     * Builds a new Tokenizer instance from the specified rulesets.
     * @returns {Tokenizer}
     */
    build () {
      confirmBuildStatus('cannot build tokenizer again');
      built = true;
      // first, create defunct function for lexer, when character does not match
      // any regex pattern in the rules
      let defunct;
      if (defaults.length === 0) {
        defunct = lexemeRequest(Lexer.defunct);
      } else {
        defunct = (lexeme) => {
          let tokens = [];
          // collate all token requests for specified lexeme
          defaults.forEach((request) => {
            let token = request(lexeme);
            if (token instanceof Array) {
              tokens.push(...token);
            } else {
              tokens.push(token);
            }
          });
          return tokens.length === 1
            ? tokens[0] // one token
            : tokens; // multiple tokens
        };
      }
      lexer = new Lexer(defunct);
      return new Tokenizer(lexer);
    }
  };

  /**
   * Throw an error message if tokenizer was already built.
   * @param {*} message the error message to show if tokenizer was already built
   */
  function confirmBuildStatus (message) {
    if (_.isUndefined(message)) {
      message = 'Error';
    } else {
      message = '' + message;
    }
    message = message || '';
    if (built) {
      throw new Error(`${message}: tokenizer was already built!`);
    }
  }

  /**
   * Wraps an action in a fail-safe lambda function. Collects line number and
   * column information for the tokenizer.
   * @param {*} action the action to wrap in a request callback
   */
  function lexemeRequest (action) {
    return (lexeme) => {
      let line = lexer.line;
      let column = lexer.column;
      let lines = ccount(lexeme, '\n');
      if (lines > 0) {
        lexer.line += lines;
        lexer.column = lexeme.length - lexeme.lastIndexOf('\n');
      } else {
        lexer.column += lexeme.length;
      }
      // create method for tokenizing (since we might map an array)
      let createToken = (type) => {
        if (_.isUndefined(type)) {
          return undefined; // skip this token
        }
        return {
          type: type,
          lexeme: lexeme,
          line: line,
          column: column
        };
      };
      // receive actual token types from argument or callback function
      let types;
      if (action instanceof Function) { // get token as a clallback
        try {
          types = action(lexeme);
        } catch (error) {
          return {
            type: error,
            line: line,
            column: column
          };
        }
      } else { // get token as is
        types = action;
      }
      // map types case of an array
      return types instanceof Array
        ? types.map(createToken)
        : createToken(types);
    };
  }
};
