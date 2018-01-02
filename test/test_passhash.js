process.env.NODE_CONFIG_DIR = "./test/config";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const logger = require('./mocks/mock_logger')();
const passH = require('../src/hashpass')(logger);

describe('HashPass Tests', () => {
    "use strict";

    const passShort = "hagiogft";
    const passAverage = "lnrtq4qljf@#wDF@%324";
    const passLong = "MVZmvz159@^(MVZmvz159@^(MVZmvz159@^(MVZmvz159@^(MVZmvz159@^(MVZmvz159@^(MVZmvz159@^(MVZmvz159@^(";
    const passBad = "";

    describe('Public Tests', () => {
        it('Hash Should Pass Length short', () => {
            return expect(passH.hashPassword(passShort))
                .to.eventually.be.a('string');
        });
        it('Hash Should Pass Length Average', () => {
            return expect(passH.hashPassword(passAverage))
                .to.eventually.be.a('string');
        });
        it('Hash Should Pass Length Long', () => {
            return expect(passH.hashPassword(passLong))
                .to.eventually.be.a('string');
        });
        it('Hash Should Fail Length Empty', () => {
            return expect(passH.hashPassword(passBad))
                .to.eventually.be.rejectedWith('Password must be greater than six characters.');
        });
        it('Hash Should Pass Compare', () => {
            return expect(passH.hashPassword(passAverage).then(result => passH.comparePassword(passAverage, result)))
                .to.eventually.equal(true);
        });
        it('Hash Should Fail Compare', () => {
            return expect(passH.hashPassword(passAverage).then(result => passH.comparePassword(passLong, result)))
                .to.eventually.equal(false);
        });
    });

});