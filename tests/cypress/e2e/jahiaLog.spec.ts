import {escapeGroovyString} from '../../../src/support/jahiaLog';

describe('jahiaLog marker escaping', () => {
    it('leaves a plain title unchanged', () => {
        expect(escapeGroovyString('creates a site')).to.equal('creates a site');
    });

    it('escapes a double quote, which would end the Groovy string', () => {
        expect(escapeGroovyString('purges older than "retentionInMonths"')).to.equal('purges older than \\"retentionInMonths\\"');
    });

    it('escapes a dollar sign, which would start a GString interpolation', () => {
        expect(escapeGroovyString('renders ${title} and $name')).to.equal('renders \\${title} and \\$name');
    });

    it('escapes a backslash before the characters it would otherwise escape', () => {
        expect(escapeGroovyString('path C:\\temp\\"x"')).to.equal('path C:\\\\temp\\\\\\"x\\"');
    });

    it('escapes line breaks, which a double-quoted Groovy string cannot hold', () => {
        expect(escapeGroovyString('first\r\nsecond')).to.equal('first\\r\\nsecond');
    });
});
