import { BaseParser } from '../parser/base/BaseParser';
import { BufferedParser } from '../parser/base/BufferedParser';
import { assert } from 'chai';

describe('parser/base/BaseParser', () => {
  it('should parse sequentially', () => {
    let parser = new BaseParser();
    parser.append('hey');
    assert.strictEqual(parser.next(), 'h');
    assert.strictEqual(parser.peek(), 'e');
    assert.strictEqual(parser.next(), 'e');
    assert.strictEqual(parser.next(), 'y');
    assert.strictEqual(parser.peek(), null);
    assert.strictEqual(parser.next(), null);
  });
  it('instanceof should work', () => {
    let parser = new BaseParser();
    assert.isTrue(parser instanceof BufferedParser);
  });
  describe('seek()', () => {
    it('should increment line number correctly', () => {
      let parser = new BaseParser();
      parser.append('hello\nworld\n');
      assert.strictEqual(parser.line, 1);
      parser.seek(parser.cursor + 'hello\n'.length);
      assert.strictEqual(parser.line, 2);
      parser.seek(parser.cursor + 'world'.length);
      assert.strictEqual(parser.line, 2);
      parser.next();
      assert.strictEqual(parser.line, 3);
    });
    it('should decrement line number correctly', () => {
      let parser = new BaseParser();
      parser.append('1\n2\n\n');
      assert.strictEqual(parser.line, 1);
      parser.seek(parser.cursor + 2);
      assert.strictEqual(parser.line, 2);
      parser.undo();
      assert.strictEqual(parser.line, 1);
      parser.seek(parser.buffer.length);
      assert.strictEqual(parser.line, 4);
      parser.seek(parser.cursor - 1);
      assert.strictEqual(parser.line, 3);
    });
  });
  describe('whitespace()', () => {
    it('should parse whitespace', () => {
      let parser = new BaseParser();
      parser.append('b');
      assert.strictEqual(parser.whitespace(), null);
      assert.strictEqual(parser.next(), 'b');
      parser.append(' ');
      assert.strictEqual(parser.whitespace(), ' ');
      parser.append('\n');
      assert.strictEqual(parser.whitespace(), '\n');
      parser.append('\t');
      assert.strictEqual(parser.whitespace(), '\t');
      assert.strictEqual(parser.whitespace(), null);
    });
    it('should parse contiguous whitespace', () => {
      let parser = new BaseParser();
      parser.append('a \n\t\t\t\n    \n\tb');
      assert.strictEqual(parser.whitespace(), null);
      assert.strictEqual(parser.next(), 'a');
      assert.strictEqual(parser.whitespace(), ' \n\t\t\t\n    \n\t');
      assert.strictEqual(parser.next(), 'b');
    });
  });
  describe('phrase(text)', () => {
    it('should parse phrases sequentially', () => {
      let parser = new BaseParser();
      parser.append('hello world');
      assert.strictEqual(parser.phrase('hello'), 'hello');
      assert.strictEqual(parser.phrase('world'), null);
      assert.strictEqual(parser.phrase(' world'), ' world');
    });
    it('should return null if text not parsed completely', () => {
      let parser = new BaseParser();
      parser.append('hello world');
      assert.strictEqual(parser.phrase('hello world '), null);
      assert.strictEqual(parser.phrase('hello world'), 'hello world');
    });
    it('should increase line number count when \'\\\\n\' is in text', () => {
      let parser = new BaseParser();
      parser.append('hello\nworld\n');
      assert.strictEqual(parser.line, 1);
      assert.strictEqual(parser.phrase('hello\nworld\n'), 'hello\nworld\n');
      assert.strictEqual(parser.line, 3);
    });
  });
});
