import { BufferedParser } from '../parser/base/BufferedParser';
import { assert } from 'chai';

describe('parser/base/BufferedParser', () => {
  it('should parse sequentially', () => {
    let parser = new BufferedParser();
    parser.append('hey');
    assert.strictEqual(parser.next(), 'h');
    assert.strictEqual(parser.peek(), 'e');
    assert.strictEqual(parser.next(), 'e');
    assert.strictEqual(parser.next(), 'y');
    assert.strictEqual(parser.peek(), null);
    assert.strictEqual(parser.next(), null);
  });
});
