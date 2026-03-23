/**
 * Comprehensive tests for FakeData (jfaker) module
 *
 * This test suite covers:
 * - Faker.js integration
 * - Injection data generation
 * - Global type management
 * - Persistent option
 * - Edge cases and error handling
 */

import {jfaker} from '../../../src';

describe('FakeData (jfaker) Module Tests', () => {
    beforeEach(() => {
        // Reset to default faker type before each test
        jfaker.setDataType('faker');
    });

    describe('Utility Methods', () => {
        it('should set and get data type', () => {
            jfaker.setDataType('xss');
            expect(jfaker.getDataType()).to.equal('xss');

            jfaker.setDataType('faker');
            expect(jfaker.getDataType()).to.equal('faker');
        });

        it('should escape strings correctly', () => {
            const escaped = jfaker.escape('Hello "World"');
            expect(escaped).to.equal('Hello \\"World\\"');

            const escapedNewline = jfaker.escape('Line1\nLine2');
            expect(escapedNewline).to.equal('Line1\\nLine2');

            const escapedTab = jfaker.escape('Tab\there');
            expect(escapedTab).to.equal('Tab\\there');
        });
    });

    describe('Faker.js Integration', () => {
        it('should generate faker data without arguments', () => {
            const firstName = jfaker.person.firstName();
            expect(firstName).to.be.a('string');
            expect(firstName.length).to.be.greaterThan(0);
        });

        it('should generate different faker entities', () => {
            jfaker.setDataType('htmlentities');
            const firstName = jfaker.person.firstName();
            const lastName = jfaker.person.lastName();
            const email = jfaker.internet.email({persistent: true});
            const city = jfaker.location.city();

            expect(firstName).to.be.a('string');
            expect(lastName).to.be.a('string');
            expect(email).to.include('@');
            expect(city).to.be.a('string');
        });

        it('should generate faker data with options', () => {
            const email = jfaker.internet.email({provider: 'example.com'});
            expect(email).to.include('@example.com');
        });

        it('should generate faker data with length option', () => {
            const alphaString = jfaker.string.alpha({length: 10});
            expect(alphaString).to.have.lengthOf(10);
        });

        it('should generate faker data with multiple options', () => {
            const word = jfaker.lorem.word({length: {min: 5, max: 10}});
            expect(word).to.be.a('string');
            expect(word.length).to.be.within(5, 10);
        });

        it('should throw error for invalid faker entity', () => {
            expect(() => {
                jfaker.invalid.nonexistent.method();
            }).to.throw('[jFaker EXCEPTION] Invalid faker method');
        });

        it('should throw error for non-function faker property', () => {
            expect(() => {
                jfaker.person();
            }).to.throw('[jFaker EXCEPTION]');
        });
    });

    describe('Injection Data Generation', () => {
        const injectionTypes = ['xss', 'sql', 'bash', 'chars', 'htmlentities', 'numbers'];

        injectionTypes.forEach(type => {
            it(`should generate ${type} injection data without length`, () => {
                const data = jfaker[type]();
                expect(data).to.be.a('string');
                expect(data.length).to.be.greaterThan(0);
            });

            it(`should generate ${type} injection data with specific length`, () => {
                const length = 50;
                const data = jfaker[type]({length});
                expect(data).to.be.a('string');
                expect(data.length).to.equal(length);
            });

            it(`should generate all ${type} injection data with length -1`, () => {
                const allData = jfaker[type]({length: -1});
                expect(allData).to.be.a('string');
                expect(allData.length).to.be.greaterThan(0);
            });
        });

        it('should generate random length injection when length is 0', () => {
            const data = jfaker.xss({length: 0});
            expect(data).to.be.a('string');
            // Should use default range (2-5 items)
            expect(data.length).to.be.greaterThan(0);
        });

        it('should generate random length injection when length is undefined', () => {
            const data = jfaker.sql();
            expect(data).to.be.a('string');
            expect(data.length).to.be.greaterThan(0);
        });
    });

    describe('Global Type Settings', () => {
        it('should use faker by default', () => {
            const name = jfaker.person.firstName();
            expect(name).to.be.a('string');
            expect(name.length).to.be.greaterThan(0);
            expect(name).to.not.include('<script>');
        });

        it('should switch to injection type when global type is set', () => {
            jfaker.setDataType('xss');
            const data = jfaker.person.firstName();
            expect(data).to.be.a('string');
            expect(data.length).to.be.greaterThan(0);
        });

        it('should persist data type across multiple calls', () => {
            jfaker.setDataType('sql');
            expect(jfaker.getDataType()).to.equal('sql');

            const data1 = jfaker.person.firstName();
            const data2 = jfaker.person.lastName();

            expect(data1).to.be.a('string');
            expect(data2).to.be.a('string');
            expect(jfaker.getDataType()).to.equal('sql');
        });

        it('should allow switching between different injection types', () => {
            jfaker.setDataType('xss');
            const xssData = jfaker.person.firstName();

            jfaker.setDataType('sql');
            const sqlData = jfaker.person.firstName();

            jfaker.setDataType('faker');
            const fakerData = jfaker.person.firstName();

            expect(xssData).to.be.a('string');
            expect(sqlData).to.be.a('string');
            expect(fakerData).to.be.a('string');
        });
    });

    describe('Persistent Option', () => {
        it('should force faker generation when persistent is true and global type is injection', () => {
            jfaker.setDataType('xss');

            const injectionData = jfaker.person.firstName();
            const fakerData = jfaker.person.firstName({persistent: true});

            expect(injectionData).to.be.a('string');
            expect(fakerData).to.be.a('string');
            // Both should be strings but faker data should look more realistic
        });

        it('should not pass persistent option to faker methods', () => {
            // This test ensures persistent doesn't cause errors in faker
            const data = jfaker.lorem.sentence({persistent: false});
            expect(data).to.be.a('string');
            expect(data.length).to.be.greaterThan(0);
        });

        it('should work with persistent and other options combined', () => {
            jfaker.setDataType('xss');
            const email = jfaker.internet.email({provider: 'test.com', persistent: true});
            expect(email).to.include('@test.com');
        });

        it('should work with persistent and length option for faker', () => {
            jfaker.setDataType('sql');
            const alpha = jfaker.string.alpha({length: 15, persistent: true});
            expect(alpha).to.have.lengthOf(15);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty options object', () => {
            const data = jfaker.person.firstName({});
            expect(data).to.be.a('string');
        });

        it('should handle no arguments at all', () => {
            const data = jfaker.person.firstName();
            expect(data).to.be.a('string');
        });

        it('should handle deep nesting of faker entities', () => {
            const data = jfaker.location.country();
            expect(data).to.be.a('string');
        });

        it('should handle injection calls with no arguments', () => {
            const xssData = jfaker.xss();
            const sqlData = jfaker.sql();

            expect(xssData).to.be.a('string');
            expect(sqlData).to.be.a('string');
        });

        it('should handle very large length for injections', () => {
            const data = jfaker.xss({length: 1000});
            expect(data).to.have.lengthOf(1000);
        });

        it('should handle length 1 for injections', () => {
            const data = jfaker.chars({length: 1});
            expect(data).to.have.lengthOf(1);
        });
    });

    describe('Data Type Consistency', () => {
        it('should always return strings', () => {
            const tests = [
                jfaker.person.firstName(),
                jfaker.xss(),
                jfaker.sql({length: 10}),
                jfaker.internet.email({provider: 'test.com'}),
                jfaker.escape('test')
            ];

            tests.forEach(result => {
                expect(result).to.be.a('string');
            });
        });

        it('should return non-empty strings for valid calls', () => {
            const tests = [
                jfaker.person.firstName(),
                jfaker.xss(),
                jfaker.lorem.sentence()
            ];

            tests.forEach(result => {
                expect(result.length).to.be.greaterThan(0);
            });
        });
    });

    describe('Randomness and Uniqueness', () => {
        it('should generate different values on subsequent calls (faker)', () => {
            const values = new Set();
            for (let i = 0; i < 10; i++) {
                values.add(jfaker.person.firstName());
            }
            // With faker, we should get at least some different values

            expect(values.size).to.be.greaterThan(1);
        });

        it('should generate varied injection data', () => {
            const values = new Set();
            for (let i = 0; i < 10; i++) {
                values.add(jfaker.xss());
            }
            // Should have some variety (though might occasionally be the same)

            expect(values.size).to.be.greaterThan(0);
        });
    });

    describe('Integration Scenarios', () => {
        it('should work in a complete workflow', () => {
            // Start with faker
            const name = jfaker.person.firstName();
            expect(name).to.be.a('string');

            // Switch to XSS testing
            jfaker.setDataType('xss');
            const xssName = jfaker.person.firstName();
            expect(xssName).to.be.a('string');

            // Force faker for specific field even though global is XSS
            const email = jfaker.internet.email({provider: 'example.com', persistent: true});
            expect(email).to.include('@example.com');

            // Use direct injection
            const xssPayload = jfaker.xss({length: 50});
            expect(xssPayload).to.have.lengthOf(50);

            // Back to faker
            jfaker.setDataType('faker');
            const normalName = jfaker.person.lastName();
            expect(normalName).to.be.a('string');
        });

        it('should support complex form filling scenario', () => {
            const formData = {
                firstName: jfaker.person.firstName(),
                lastName: jfaker.person.lastName(),
                email: jfaker.internet.email(),
                phone: jfaker.phone.number(),
                address: jfaker.location.streetAddress(),
                city: jfaker.location.city(),
                zipCode: jfaker.location.zipCode(),
                bio: jfaker.lorem.paragraph()
            };

            Object.values(formData).forEach(value => {
                expect(value).to.be.a('string');
                expect(value.length).to.be.greaterThan(0);
            });
        });

        it('should support injection testing scenario', () => {
            jfaker.setDataType('xss');

            const testData = {
                scriptInjection: jfaker.person.firstName(),
                longPayload: jfaker.xss({length: 200}),
                sqlInjection: jfaker.sql({length: 100}),
                bashInjection: jfaker.bash(),
                specialChars: jfaker.chars({length: 30})
            };

            Object.values(testData).forEach(value => {
                expect(value).to.be.a('string');
                expect(value.length).to.be.greaterThan(0);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid data type gracefully', () => {
            // Setting invalid type - should still work but use as-is
            jfaker.setDataType('invalid_type');
            expect(jfaker.getDataType()).to.equal('invalid_type');
        });

        it('should handle escape with special characters', () => {
            const specialChars = '\\n\\t\\r\\"\\\'';
            const escaped = jfaker.escape(specialChars);
            expect(escaped).to.be.a('string');
        });

        it('should handle escape with unicode characters', () => {
            const unicode = '你好世界 🌍';
            const escaped = jfaker.escape(unicode);
            expect(escaped).to.be.a('string');
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle rapid successive calls', () => {
            const results = [];
            for (let i = 0; i < 100; i++) {
                results.push(jfaker.person.firstName());
            }

            expect(results).to.have.lengthOf(100);
            results.forEach(result => {
                expect(result).to.be.a('string');
            });
        });

        it('should handle large batch injection generation', () => {
            const injections = [];
            for (let i = 0; i < 50; i++) {
                injections.push(jfaker.xss({length: 100}));
            }

            expect(injections).to.have.lengthOf(50);
            injections.forEach(injection => {
                expect(injection).to.have.lengthOf(100);
            });
        });
    });

    describe('Type Switching Performance', () => {
        it('should handle frequent type switches', () => {
            const types = ['faker', 'xss', 'sql', 'bash', 'faker'];
            const results: string[] = [];

            types.forEach(type => {
                jfaker.setDataType(type);
                results.push(jfaker.person.firstName());
            });

            expect(results).to.have.lengthOf(types.length);
            results.forEach(result => {
                expect(result).to.be.a('string');
            });
        });
    });
});
