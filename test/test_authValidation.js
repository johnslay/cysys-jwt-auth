process.env.NODE_CONFIG_DIR = "./test/config";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const logger = require('./mocks/mock_logger')();
//const dbAccess = require('./mocks/mock_dbAccess')();
const config = require('config');
const passwd = config.Controls.Password;
const authV = require('../src/authValidation')(logger, passwd);
const eType = 'authVal';

describe('Account Validation Tests', () => {
    "use strict";

    const pwo = {};
    pwo.password = 'password';
    pwo.must_reset = true;
    pwo.password_date = new Date().getTime();
    pwo.password_expires = true;
    pwo.attempt_count = 4;
    pwo.last_attempt = new Date().getTime();
    pwo.locked = true;
    pwo.locked_date = new Date().getTime();

    describe('Public Tests', () => {
        it('Account Unlocked Should Pass', () => {
            pwo.locked = false;
            return expect(authV.CheckLockout(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Locked Should Fail', () => {
            pwo.locked = true;
            return expect(authV.CheckLockout(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Account is locked out');
                    expect(err).to.have.property('type', eType);
                });
        });
        it('Account No Reset Should Pass', () => {
            pwo.must_reset = false;
            return expect(authV.CheckReset(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Must Reset Should Fail', () => {
            pwo.must_reset = true;
            return expect(authV.CheckReset(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Account Password Must Be Reset');
                    expect(err).to.have.property('type', eType);
                });
        });
        it('Account Not Expired Should Pass', () => {
            pwo.password_date = new Date().getTime();
            pwo.password_expires = true;
            return expect(authV.CheckExpired(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Not Expired Should Pass 89', () => {

            let dte = new Date();
            dte.setDate(dte.getDate() - 89);

            pwo.password_date = dte.getTime();
            pwo.password_expires = true;
            return expect(authV.CheckExpired(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Expired Should Fail 91', () => {

            let dte = new Date();
            dte.setDate(dte.getDate() - 91);

            pwo.password_date = dte.getTime();
            pwo.password_expires = true;
            return expect(authV.CheckExpired(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Password has expired and must be changed');
                    expect(err).to.have.property('type', eType);
                });
        });
        it('Account Expired Should Fail 190', () => {

            let dte = new Date();
            dte.setDate(dte.getDate() - 190);

            pwo.password_date = dte.getTime();
            pwo.password_expires = true;
            return expect(authV.CheckExpired(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Password has expired and must be changed');
                    expect(err).to.have.property('type', eType);
                });
        });
        it('Account Expired But Not Required Should Pass 190', () => {

            let dte = new Date();
            dte.setDate(dte.getDate() - 190);

            pwo.password_date = dte.getTime();
            pwo.password_expires = false;
            return expect(authV.CheckExpired(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Attempt Under Threshold Should Pass 1', () => {
            pwo.last_attempt = new Date().getTime();
            pwo.attempt_count = 1;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Attempt Under Threshold Should Pass 3', () => {
            pwo.last_attempt = new Date().getTime();
            pwo.attempt_count = 3;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Attempt Over Threshold Should Fail 4', () => {
            pwo.last_attempt = new Date().getTime();
            pwo.attempt_count = 4;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Too Many Authentication attempts');
                    expect(err).to.have.property('type', eType);
                });
        });
        it('Account Attempt Over Threshold Should Fail 40', () => {
            pwo.last_attempt = new Date().getTime();
            pwo.attempt_count = 40;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Too Many Authentication attempts');
                    expect(err).to.have.property('type', eType);
                });
        });
        it('Account Attempt Over Threshold But Wait Time Expired Should Pass 16', () => {

            let dte = new Date().getTime();
            dte = dte - (60000 * 16);
            pwo.last_attempt = dte;

            pwo.attempt_count = 5;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Attempt Over Threshold But Wait Time Expired Should Pass 160', () => {

            let dte = new Date().getTime();
            dte = dte - (60000 * 160);
            pwo.last_attempt = dte;

            pwo.attempt_count = 5;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.a('object');
        });
        it('Account Attempt Over Threshold But Wait Time Not Expired Should Fail 14', () => {

            let dte = new Date().getTime();
            dte = dte - (60000 * 14);
            pwo.last_attempt = dte;

            pwo.attempt_count = 5;
            return expect(authV.CheckAttempts(pwo))
                .to.eventually.be.rejected
                .then(function(err){
                    expect(err).to.have.property('message', 'Too Many Authentication attempts');
                    expect(err).to.have.property('type', eType);
                });
        });
    });

});