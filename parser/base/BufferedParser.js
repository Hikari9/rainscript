// private fields of BufferedParser
const _cursor = new WeakMap();
const _buffer = new WeakMap();

/**
 * A buffered input parser.
 */
export class BufferedParser {
  constructor () {
    this.clear();
  }
}

/**
 * Adopt explicit prototype design pattern to create this BufferedParser
 * object. This is preferred over hidden class methods because we plan
 * to have multiple inheritance of parsers for this project.
 */
BufferedParser.prototype = {
  /**
   * Getter to the cursor of this buffer.
   */
  get cursor () {
    return _cursor[this];
  },

  /**
   * Getter to the buffer string.
   */
  get buffer () {
    return _buffer[this];
  },

  /**
   * Clears the parser's buffer. A flowable method.
   * @return this
   */
  clear () {
    _buffer[this] = '';
    _cursor[this] = 0;
    return this;
  },

  /**
   * Go back one step, and return the character at that spot in the buffer.
   * @return the previous character in the buffer
   */
  undo () {
    if (--_cursor[this] < 0) _cursor[this] = 0;
    return this.buffer[this.cursor];
  },

  /**
   * Peeks at the next character in the buffer, or null if EOF.
   * @return the next character in the buffer
   */
  peek () {
    return this.cursor < this.buffer.length
      ? this.buffer[this.cursor]
      : null;
  },

  /**
   * Gets the next character in the buffer, or null if EOF.
   * @return the next character in the buffer
   */
  next () {
    return this.cursor < this.buffer.length
      ? this.buffer[_cursor[this]++]
      : null;
  },

  /**
   * Seeks a specific cursor position and sets it as the new cursor.
   * @param {int} cursor the cursor position to seek.
   */
  seek (cursor) {
    while (this.cursor < cursor) this.next();
    while (this.cursor > cursor) this.undo();
  },

  /**
   * Appends new information to the buffer. A flowable method.
   * @param {String} buffer the new information to append
   * @return this
   */
  append (buffer) {
    _buffer[this] += buffer;
    return this;
  }
};
