import { LinkedList } from './util/LinkedList';
import { Environment } from './util/Environment';
import { CommentsRemover } from './util/CommentsRemover';
import { FullParserTemplate } from './FullParserTemplate';

export class FullParser {
  /**
   * Constructs this FullParser.
   */
  constructor () {
    // copy contents from template
    Object.assign(this, FullParserTemplate);
    // create buffer
    this.replace();
  }

  /**
   * Replaces the parser's buffer. Flowable.
   * @param {*} buffer the new buffer to replace with
   */
  replace (buffer) {
    this.buffer = '';
    this.index = 0;
    this.line = 1;
    this.errors = new LinkedList();
    this.warning = new LinkedList();
    this.environment = new Environment();
    return buffer ? this.append(buffer) : this;
  }

  /**
   * Appends new information to the buffer. Flowable.
   * @param {*} buffer the new information to append
   */
  append (buffer) {
    this.buffer += CommentsRemover.all(buffer);
    return this;
  }
}
