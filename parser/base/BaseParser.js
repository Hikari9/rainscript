import { BufferedParser } from './BufferedParser';
import { Environment } from '../util/Environment';
import { LinkedList } from '../util/LinkedList';

// private fields of base parser
const _line = new WeakMap();

/**
 * The basic parser. This will be the base prototype for all other intended
 * parsers for Rainscript.
 */
export class BaseParser extends BufferedParser {}

/**
 * Adopt explicit prototype design pattern to create this BaseParser
 * object. This is preferred over hidden class methods because we plan
 * to have multiple inheritance of parsers for this project.
 */
BaseParser.prototype = {

  /**
   * Getter to the line number the buffer is currently at.
   * @return {int} the line number
   */
  get line () {
    return _line[this];
  },

  /**
   * Clears the parser's buffer. A flowable method.
   * @override
   * @return this
   */
  clear () {
    super.clear();
    // start line number with 1-based indexing
    _line[this] = 1;
    // reset list of errors and warnings
    this.errors = new LinkedList();
    this.warnings = new LinkedList();
    this.environment = new Environment();
    return this;
  },

  /**
   * Logs an error during parsing. The message will be paired with the line
   * number.
   * @param {*} message the error message
   */
  error (message) {
    this.errors = this.errors.push([this.line, message]);
    return this;
  },

  /**
   * Logs a warning during parsing. The message will be paired with the line
   * number.
   * @param {*} message the warning message
   */
  warning (message) {
    this.warnings = this.warnings.push([this.line, message]);
    return this;
  },

  /**
   * Gets the next character in the buffer, or null if EOF.
   * @override
   * @return the next character in the buffer
   */
  next () {
    let nextCharacter = super.next();
    // increment line number if necessary
    if (nextCharacter === '\n') ++_line[this];
    return nextCharacter;
  },

  /**
   * Gets the next character in the buffer, or null if EOF.
   * @override
   * @return the next character in the buffer
   */
  undo () {
    let undoCharacter = super.undo();
    // decrement line number if necessary
    if (undoCharacter === '\n') --_line[this];
    return undoCharacter;
  },

  /**
   * Matches the next contiguous whitespace, or null if not found.
   */
  whitespace () {
    let space = '';
    while (/\s/.test(this.peek())) {
      space += this.next();
    }
    return space.length > 0 ? space : null;
  },

  /**
   * Matches a specific text phrase in the buffer, or null if not found.
   * @param {String} text the text to match
   */
  phrase (text) {
    if (this.buffer.slice(this.cursor, this.cursor + text.length) === text) {
      this.seek(this.cursor + text.length);
      return text;
    }
    return null;
  }

};

Object.setPrototypeOf(BaseParser.prototype, BufferedParser.prototype);
