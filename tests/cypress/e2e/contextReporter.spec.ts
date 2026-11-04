/* eslint-disable @typescript-eslint/no-explicit-any */
import {context, getTags} from '../../../src/support/contextReporter';

const currentTags = (): string[] => getTags((cy as any).state('runnable'));

describe('Context reporter: tags of a describe() with no it() of its own', () => {
    context.tag('outer');

    describe('first inner block', () => {
        it('gets the tags of the outer block', () => {
            expect(currentTags()).to.deep.equal(['outer']);
        });
    });

    describe('second inner block', () => {
        context.tag('second');

        it('gets the tags of the outer block and of its own block', () => {
            expect(currentTags()).to.deep.equal(['outer', 'second']);
        });

        describe('nested block', () => {
            it('gets the tags of every enclosing block', () => {
                context.tag('test');
                expect(currentTags()).to.deep.equal(['outer', 'second', 'test']);
            });
        });
    });
});

describe('Context reporter: tags of a describe() with an it() of its own', () => {
    context.tag('suite');

    it('gets the tags of its block', () => {
        expect(currentTags()).to.deep.equal(['suite']);
    });

    describe('inner block', () => {
        it('gets the tags of the outer block', () => {
            expect(currentTags()).to.deep.equal(['suite']);
        });
    });
});

describe('Context reporter: tags of a sibling describe()', () => {
    it('gets none of the tags of the blocks before it', () => {
        expect(currentTags()).to.deep.equal([]);
    });
});
