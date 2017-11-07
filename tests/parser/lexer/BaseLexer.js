import { BaseLexer } from '../../../parser/lexer/BaseLexer';
require('chai').should();

describe('parser', () => {
  describe('lexer', () => {
    describe('BaseLexer', () => {
      it('should start with line 1 column 1', () => {
        let lexer = new BaseLexer();
        lexer.line.should.equal(1);
        lexer.column.should.equal(1);
      });

      it('should increment column for every character', () => {
        let lexer = new BaseLexer((character) => {
          throw new Error('invalid character ' + character);
        });
        // add rules
        lexer.addRule(/hello/, 'HELLO');
        lexer.addRule(/world/, 'WORLD');
        lexer.addRule(/\s+/, 'WHITESPACE');
        // add input
        lexer.setInput('hello world');
        // perform column checks
        lexer.lex().column.should.equal(1);
        lexer.lex().column.should.equal(1 + 'hello'.length);
        lexer.lex().column.should.equal(1 + 'hello '.length);
        lexer.lex.should.throw(Error);
      });

      it('should increment line for every newline', () => {
        let lexer = new BaseLexer((character) => {
          throw new Error('invalid character ' + character);
        });
        // add rules
        lexer.addRule(/hello/, 'HELLO');
        lexer.addRule(/world/, 'WORLD');
        lexer.addRule(/\s+/, 'WHITESPACE');
        // add input
        lexer.setInput('hello\nworld\n\nhello   \n  \n\n  ');
        // perform column checks
        lexer.lex().line.should.equal(1); // hello
        lexer.lex().line.should.equal(1);
        lexer.line.should.equal(2);
        lexer.lex().line.should.equal(2); // world
        lexer.lex().line.should.equal(2);
        lexer.line.should.equal(4);
        lexer.lex().line.should.equal(4); // hello
        lexer.lex().line.should.equal(4);
        lexer.line.should.equal(7);
        lexer.lex.should.throw(Error);
      });

      it('should increment reset column count after newline', () => {
        let lexer = new BaseLexer((character) => {
          throw new Error('invalid character ' + character);
        });
        lexer.addRule(/\S+/, 'WORD');
        lexer.addRule(/\s+/, 'WHITESPACE');
        // add input
        lexer.setInput('hello\nworld\n\n \thello');
        // perform column checks

        lexer.lex();
        lexer.line.should.equal(1);
        lexer.column.should.equal('hello'.length + 1);

        lexer.lex();
        lexer.line.should.equal(2);
        lexer.column.should.equal(1);

        lexer.lex();
        lexer.line.should.equal(2);
        lexer.column.should.equal('world'.length + 1);

        lexer.lex();
        lexer.line.should.equal(4);
        lexer.column.should.equal(' \t'.length + 1);
        lexer.lex.should.throw(Error);
      });
    });
  });
});
