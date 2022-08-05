"use strict";
const expected = require('chai').expect;
describe("Simple test to ensure passing", () => {
    it('should always pass', () => {
        expected(1 + 1).to.equal(2);
    });
});
