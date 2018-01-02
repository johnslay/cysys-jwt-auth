/**
 * Created by michael on 3/4/17.
 */

process.env.NODE_CONFIG_DIR = "./test/config";
const test_uid = '12345678-0000-0000-0000-ab0123456789';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const logger = require('./mocks/mock_logger')();
const rnd = new Date().getTime().toString();
const testAuthDB = './test/testdb/authdb' + rnd;
const testTrustedDB = './test/testdb/trusteddb' + rnd;
const testRefreshDB = './test/testdb/refreshdb' + rnd;
const testAccessDB = './test/testdb/accessdb' + rnd;
const testConfigDB = './test/testdb/configdb' + rnd;

const db = require('../src/databases')(testAuthDB, testTrustedDB, testConfigDB, testRefreshDB, testAccessDB, logger);
const dbAccess = require('../src/userDBAccess')(db,14,logger);
const trustAccess = require('../src/trustedDBAccess')(db, logger);

describe('dbAccess Tests', () => {
    "use strict";
    describe('DB Tests', () => {
        it('Should return success for valid authDB Object', () => {
            expect(db.authDB).to.be.a('object');
        });
        it('Should return success for valid authDB Object', () => {
            expect(db.trustedDB).to.be.a('object');
        });
        it('Should return success for valid authDB Object', () => {
            expect(db.configDB).to.be.a('object');
        });
        it('Should return success for valid refreshTokenDB Object', () => {
            expect(db.refreshTokenDB).to.be.a('object');
        });
        it('Should return success for valid accessTokenDB Object', () => {
            expect(db.accessTokenDB).to.be.a('object');
        });
    });
    describe('DB User Access Tests', () => {
        it('Admin account should not exist on first run', () => {
            return expect(dbAccess.admin_exists()).to.eventually.equal(false);
        });
        it('Admin account creation successful', () => {
            return expect(dbAccess.create_admin('password')).to.eventually.equal(true);
        });
        it('Admin account exists', () => {
            return expect(dbAccess.admin_exists()).to.eventually.equal(true);
        });
        it('Get admin account id', () => {
            return expect(dbAccess.get_user_id('admin')).to.eventually.equal('00000000-0000-0000-0000-ab0123456789');
        });
        it('Admin account properties for admin are correct', () => {
            return expect(dbAccess.retrieve_user_admin('00000000-0000-0000-0000-ab0123456789')).to.eventually.have.keys('uid'
                , 'alias'
                , 'username'
                , 'first_name'
                , 'last_name'
                , 'title'
                , 'email_address'
                , 'locked'
                , 'can_delete'
                , 'must_reset'
                , 'is_admin'
                , 'last_login')
                .then((result) => {
                    expect(result.uid).to.equal('00000000-0000-0000-0000-ab0123456789');
                    expect(result.alias).to.equal('admin');
                    expect(result.username).to.equal('admin');
                    expect(result.first_name).to.equal('root');
                    expect(result.last_name).to.equal('admin');
                    expect(result.title).to.equal('Administrator');
                    expect(result.email_address).to.equal('admin@cysysone.narrowgt.com');
                    expect(result.locked).to.equal(false);
                    expect(result.can_delete).to.equal(false);
                    expect(result.must_reset).to.equal(false);
                    expect(result.is_admin).to.equal(true);
                    expect(result.last_login).to.be.a('number');
                })
                .catch();
        });
        it('Admin account properties for user are correct', () => {
            return expect(dbAccess.retrieve_user_user('00000000-0000-0000-0000-ab0123456789')).to.eventually.have.keys('uid'
                , 'alias'
                , 'username'
                , 'first_name'
                , 'last_name'
                , 'title'
                , 'email_address'
                , 'last_login')
                .then((result) => {
                    expect(result.uid).to.equal('00000000-0000-0000-0000-ab0123456789');
                    expect(result.alias).to.equal('admin');
                    expect(result.username).to.equal('admin');
                    expect(result.first_name).to.equal('root');
                    expect(result.last_name).to.equal('admin');
                    expect(result.title).to.equal('Administrator');
                    expect(result.email_address).to.equal('admin@cysysone.narrowgt.com');
                    expect(result.last_login).to.be.a('number');
                });
        });
        it('Admin account password info properties are correct', () => {
            return expect(dbAccess.get_password_info('00000000-0000-0000-0000-ab0123456789')).to.eventually.have.keys('password_date'
                , 'password_expires'
                , 'attempt_count'
                , 'last_attempt'
                , 'locked'
                , 'locked_date'
                , 'must_reset'
                , 'password')
                .then((result) => {
                    expect(result.password_expires).to.equal(false);
                    expect(result.attempt_count).to.equal(0);
                    expect(result.locked).to.equal(false);
                    expect(result.must_reset).to.equal(false);
                    expect(result.password).to.equal('password');
                });
        });
        it('Create new user (alfie) account', () => {
            return expect(dbAccess.create_user('SSgt'
                , 'alfie'
                , 'FName'
                , 'LName'
                , 'alfie@email.com'
                , false
                , 'alfiepassword'
                , true
                , false)).to.eventually.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
        });
        it('Create new user (stephon) account with assigned UID', () => {
            return expect(dbAccess.create_user('SSgt'
                , 'stephon'
                , 'FName'
                , 'LName'
                , 'stephon@email.com'
                , false
                , 'stephonpassword'
                , true
                , false
                , test_uid)).to.eventually.equal(test_uid);
        });
        it('Create new user (ralphie) should fail with bad uid', () => {
            return expect(dbAccess.create_user('SSgt'
                , 'ralphie'
                , 'FName'
                , 'LName'
                , 'ralphie@email.com'
                , false
                , 'ralphiepassword'
                , true
                , false
                , test_uid + 't65')).to.eventually.be.rejectedWith('Malformed UID');
        });
        it('Admin account properties for user (randy) are correct', () => {

            let uid = '';

            return dbAccess.create_user('SSgt'
                , 'randy'
                , 'FName'
                , 'LName'
                , 'randy@email.com'
                , false
                , 'randypassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('randy@email.com')
                    .then(result => {
                        uid = result;
                        return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                            , 'alias'
                            , 'username'
                            , 'first_name'
                            , 'last_name'
                            , 'title'
                            , 'email_address'
                            , 'locked'
                            , 'can_delete'
                            , 'must_reset'
                            , 'is_admin'
                            , 'last_login')
                            .then((result) => {
                                expect(result.uid).to.equal(uid);
                                expect(result.alias).to.equal('randy');
                                expect(result.username).to.equal('randy@email.com');
                                expect(result.first_name).to.equal('FName');
                                expect(result.last_name).to.equal('LName');
                                expect(result.title).to.equal('SSgt');
                                expect(result.email_address).to.equal('randy@email.com');
                                expect(result.locked).to.equal(false);
                                expect(result.can_delete).to.equal(true);
                                expect(result.must_reset).to.equal(false);
                                expect(result.is_admin).to.equal(false);
                                expect(result.last_login).to.be.a('number');
                            });
                    })
                );
        });
        it('User (bubba2) account password info properties are correct', () => {
            return dbAccess.create_user('SSgt'
                , 'bubba2'
                , 'FName'
                , 'LName'
                , 'bubba2@email.com'
                , false
                , 'bubba2password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bubba2@email.com')
                    .then(result => {
                            return expect(dbAccess.get_password_info(result)).to.eventually.have.keys('password_date'
                                , 'password_expires'
                                , 'attempt_count'
                                , 'last_attempt'
                                , 'locked'
                                , 'locked_date'
                                , 'must_reset'
                                , 'password')
                                .then((result) => {
                                    expect(result.password_expires).to.equal(true);
                                    expect(result.attempt_count).to.equal(0);
                                    expect(result.locked).to.equal(false);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.password).to.equal('bubba2password');
                                });
                        })
                    );
        });
        it('Update user (frank)', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            return dbAccess.create_user('SSgt'
                , 'frank'
                , 'FName'
                , 'LName'
                , 'frank@email.com'
                , false
                , 'frankpassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('frank@email.com')
                    .then(result => {
                        return expect(dbAccess.update_user(result
                            , 'frank2@email.com'
                            , 'SSgt2'
                            , 'frank2'
                            , 'FName2'
                            , 'LName2'
                            , 'frank2@email.com'
                            , true
                            , false
                            , true)).to.eventually.equal(true);
                    })
                );
        });
        it('Admin account properties for user (bubba) update are correct', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin

            let uid = '';

            return dbAccess.create_user('SSgt3'
                , 'frank3'
                , 'FName'
                , 'LName'
                , 'frank3@email.com'
                , true
                , 'frank3password'
                , true
                , true)
                .then(() => dbAccess.get_user_id('frank3@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , 'frank3a@email.com'
                        , 'SSgt3a'
                        , 'frank3a'
                        , 'FName3a'
                        , 'LName3a'
                        , 'frank3a@email.com'
                        , false
                        , false
                        , false)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('frank3a');
                                    expect(result.username).to.equal('frank3@email.com');
                                    expect(result.first_name).to.equal('FName3a');
                                    expect(result.last_name).to.equal('LName3a');
                                    expect(result.title).to.equal('SSgt3a');
                                    expect(result.email_address).to.equal('frank3a@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob1) username - no change', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin

            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob1'
                , 'FName1'
                , 'LName1'
                , 'bob1@email.com'
                , false
                , 'bob1password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob1@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , 'bob1a@email.com'
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob1');
                                    expect(result.username).to.equal('bob1@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob1@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob2) title', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob2'
                , 'FName1'
                , 'LName1'
                , 'bob2@email.com'
                , false
                , 'bob2password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob2@email.com')
                    .then(result => {
                        uid= result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , 'SSgt1a'
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob2');
                                    expect(result.username).to.equal('bob2@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1a');
                                    expect(result.email_address).to.equal('bob2@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob22) alias', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob22'
                , 'FName1'
                , 'LName1'
                , 'bob22@email.com'
                , false
                , 'bob22password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob22@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , 'Bob22a'
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob22a');
                                    expect(result.username).to.equal('bob22@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob22@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob3) first name', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob3'
                , 'FName1'
                , 'LName1'
                , 'bob3@email.com'
                , false
                , 'bob3password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob3@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , null
                        , 'FName1a'
                        , null
                        , null
                        , null
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob3');
                                    expect(result.username).to.equal('bob3@email.com');
                                    expect(result.first_name).to.equal('FName1a');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob3@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob4) last name', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob4'
                , 'FName1'
                , 'LName1'
                , 'bob4@email.com'
                , false
                , 'bob4password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob4@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , null
                        , null
                        , 'LName1a'
                        , null
                        , null
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob4');
                                    expect(result.username).to.equal('bob4@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1a');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob4@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob5) email', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob5'
                , 'FName1'
                , 'LName1'
                , 'bob5@email.com'
                , false
                , 'bob5password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob5@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , null
                        , null
                        , null
                        , 'bob5a@email.com'
                        , null
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob5');
                                    expect(result.username).to.equal('bob5@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob5a@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob6) must reset', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob6'
                , 'FName1'
                , 'LName1'
                , 'bob6@email.com'
                , false
                , 'bob6password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob6@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , true
                        , null
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob6');
                                    expect(result.username).to.equal('bob6@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob6@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(true);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob7), password expires', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob7'
                , 'FName1'
                , 'LName1'
                , 'bob7@email.com'
                , false
                , 'bob7password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob7@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , false
                        , null)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob7');
                                    expect(result.username).to.equal('bob7@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob7@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(false);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Update user (bob8), is admin', () => {
            //uid, userName, title, alias, firstName, lastName, emailAddress, mustReset, passwordExpires, isAdmin
            let uid = '';

            return dbAccess.create_user('SSgt1'
                , 'Bob8'
                , 'FName1'
                , 'LName1'
                , 'bob8@email.com'
                , false
                , 'bob8password'
                , true
                , false)
                .then(() => dbAccess.get_user_id('bob8@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_user(result
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , null
                        , true)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                , 'alias'
                                , 'username'
                                , 'first_name'
                                , 'last_name'
                                , 'title'
                                , 'email_address'
                                , 'locked'
                                , 'can_delete'
                                , 'must_reset'
                                , 'is_admin'
                                , 'last_login')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.alias).to.equal('Bob8');
                                    expect(result.username).to.equal('bob8@email.com');
                                    expect(result.first_name).to.equal('FName1');
                                    expect(result.last_name).to.equal('LName1');
                                    expect(result.title).to.equal('SSgt1');
                                    expect(result.email_address).to.equal('bob8@email.com');
                                    expect(result.locked).to.equal(false);
                                    expect(result.can_delete).to.equal(true);
                                    expect(result.must_reset).to.equal(false);
                                    expect(result.is_admin).to.equal(true);
                                    expect(result.last_login).to.be.a('number');
                                });
                        })

                    ));
        });
        it('Increment account (fiona) login attempt', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Fiona'
                , 'FName1'
                , 'LName1'
                , 'fiona@email.com'
                , false
                , 'fionapassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('fiona@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.update_login_attempt_count(result)
                        .then(() => {
                            return expect(dbAccess.get_password_info(uid)).to.eventually.have.property('attempt_count', 1);
                        })

                    ));
        });
        it('Reset counter for account (tom) login attempt', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Tom'
                , 'FName1'
                , 'LName1'
                , 'tom@email.com'
                , false
                , 'tompassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('tom@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => {
                        return dbAccess.update_login_attempt_count(result)
                            .then (() => dbAccess.reset_login_attempt_count(uid))
                                .then(() => {
                                    return expect(dbAccess.get_password_info(uid)).to.eventually.have.property('attempt_count', 0);
                                })
                    }));
        });
        it('Set (toga) last login', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Toga'
                , 'FName1'
                , 'LName1'
                , 'toga@email.com'
                , false
                , 'togapassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('toga@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then(result => {
                        let currll = new Date().getTime();
                        return dbAccess.retrieve_user_admin(uid)
                            .then(result => {
                                currll = result.last_login;
                                return dbAccess.set_last_login(uid)
                                    .then(() => {
                                        return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.keys('uid'
                                            , 'alias'
                                            , 'username'
                                            , 'first_name'
                                            , 'last_name'
                                            , 'title'
                                            , 'email_address'
                                            , 'locked'
                                            , 'can_delete'
                                            , 'must_reset'
                                            , 'is_admin'
                                            , 'last_login')
                                            .then((result) => {
                                                expect(result.last_login).to.not.equal(currll);
                                            })
                                    })
                            })
                    }));
        });
        it('Lock user (chris) account', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Chris'
                , 'FName1'
                , 'LName1'
                , 'chris@email.com'
                , false
                , 'chrispassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('chris@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.lock_account(result)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.property('locked', true);
                        })

                    ));
        });
        it('Unlock user (mike) account', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Mike'
                , 'FName1'
                , 'LName1'
                , 'mike@email.com'
                , false
                , 'mikepassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('mike@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => {
                        return dbAccess.lock_account(result)
                            .then (() => dbAccess.unlock_account(uid))
                            .then(() => {
                                return expect(dbAccess.retrieve_user_admin(uid)).to.eventually.have.property('locked', false);
                            })
                    }));
        });
        it('Reset user (hal) password', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Hal'
                , 'FName1'
                , 'LName1'
                , 'hal@email.com'
                , false
                , 'halpassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('hal@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.reset_password(result, 'newpassword', true)
                        .then(() => {
                            return expect(dbAccess.get_password_info(uid)).to.eventually.have.property('password', 'newpassword');
                        })

                    ));
        });
        it('Delete user (rain)', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Rain'
                , 'FName1'
                , 'LName1'
                , 'rain@email.com'
                , false
                , 'rainpassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('rain@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.delete_user(uid)
                        .then(() => {
                            return expect(dbAccess.retrieve_user_user(uid)).to.eventually.rejectedWith(/^User [a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12} not found./);
                        })

                    ));
        });
        it('Verify password history length (2)', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Howard'
                , 'FName1'
                , 'LName1'
                , 'howard@email.com'
                , false
                , 'howardpassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('howard@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.reset_password(result, 'newpassword', true)
                        .then(() => {
                            return expect(dbAccess.get_password_history(uid)).to.eventually.have.length(2);
                        })

                    ));
        });
        it('Verify password (allenpassword) exists in password history', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Allen'
                , 'FName1'
                , 'LName1'
                , 'allen@email.com'
                , false
                , 'allenpassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('allen@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.reset_password(result, 'newpassword', true)
                        .then(() => {
                            return expect(dbAccess.get_password_history(uid)).to.eventually.contain('allenpassword');
                        })

                    ));
        });
        it('Verify password (newpassword) exists in password history', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Brody'
                , 'FName1'
                , 'LName1'
                , 'brody@email.com'
                , false
                , 'brodypassword'
                , true
                , false)
                .then(() => dbAccess.get_user_id('brody@email.com')
                    .then(result => {
                        uid = result;
                        return result;
                    })
                    .then (result => dbAccess.reset_password(result, 'newpassword', true)
                        .then(() => {
                            return expect(dbAccess.get_password_history(uid)).to.eventually.contain('newpassword');
                        })

                    ));
        });
        it('Get All Users Admin', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Will'
                , 'FName1'
                , 'LName1'
                , 'will@email.com'
                , false
                , 'willpassword'
                , true
                , false)
                .then(() => {
                    return dbAccess.create_user('SSgt1'
                        , 'Harry'
                        , 'FName1'
                        , 'LName1'
                        , 'harry@email.com'
                        , false
                        , 'harrypassword'
                        , true
                        , false)
                        .then(() => {
                            return dbAccess.create_user('SSgt1'
                                , 'Sam'
                                , 'FName1'
                                , 'LName1'
                                , 'sam@email.com'
                                , false
                                , 'sampassword'
                                , true
                                , false)
                                .then(() => {
                                    return expect(dbAccess.retrieve_all_users_admin()).to.eventually.have.length.above(2)
                                })
                        })
                });
        });
        it('Get All Users user', () => {
            let uid = '';
            return dbAccess.create_user('SSgt1'
                , 'Carl'
                , 'FName1'
                , 'LName1'
                , 'carl@email.com'
                , false
                , 'carlpassword'
                , true
                , false)
                .then(() => {
                    return dbAccess.create_user('SSgt1'
                        , 'Steven'
                        , 'FName1'
                        , 'LName1'
                        , 'steven@email.com'
                        , false
                        , 'stevenpassword'
                        , true
                        , false)
                        .then(() => {
                            return dbAccess.create_user('SSgt1'
                                , 'Carol'
                                , 'FName1'
                                , 'LName1'
                                , 'carol@email.com'
                                , false
                                , 'carolpassword'
                                , true
                                , false)
                                .then(() => {
                                    return expect(dbAccess.retrieve_all_users_user()).to.eventually.have.length.above(2)
                                })
                        })
                });
        });
        it('Duplice user create should fail', () => {
            return dbAccess.create_user('SSgt1'
                , 'Zoro'
                , 'FName1'
                , 'LName1'
                , 'zoro@email.com'
                , false
                , 'zoropassword'
                , true
                , false)
                .then(() => {
                    return expect(dbAccess.create_user('SSgt1'
                        , 'Stephan'
                        , 'FName1'
                        , 'LName1'
                        , 'zoro@email.com'
                        , false
                        , 'stephanpassword'
                        , true
                        , false))
                        .to.eventually.be.rejectedWith('Account with username \'zoro@email.com\' already exists')
                })
        });
    });

    describe('DB Trust Access Tests', () => {
        it('Test For Trust Not Exist Should Fail', () => {
            return expect(trustAccess.get_trust_id('noapp'))
                .to.eventually.be.rejectedWith('Trust for noapp not found.');
        });
        it('Create new trust (app1)', () => {
            return expect(trustAccess.create_trust('app1','Sam Watkins', 'sam@email.com', '12m'))
                .to.eventually.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
        });
        it('Create new trust (app1a) with assigned uid', () => {
            return expect(trustAccess.create_trust('app1a','Sammy Watkins', 'sammy@email.com', '13m', test_uid))
                .to.eventually.equal(test_uid);
        });
        it('Create new trust (app1b) to fail with bad uid', () => {
            return expect(trustAccess.create_trust('app1b','Roger Watkins', 'roger@email.com', '13m', test_uid + 't2w'))
                .to.eventually.be.rejectedWith('Malformed UID');
        });
        it('Get Trust ID from known app', () => {
            return expect(trustAccess.create_trust('app0','Sadie Watkins', 'sadie@email.com', '12m')
                .then(result => {
                    return expect(trustAccess.get_trust_id('app0')).to.eventually.equal(result);
                }));
        });
        it('Trust Propeties (app2) are correct', () => {
            let uid = '';
            return trustAccess.create_trust('app2','app2Name', 'app2Name@email.com', '18m')
                .then((result) => {
                    uid = result;
                    return expect(trustAccess.retrieve_trust(result)).to.eventually.have.keys('uid'
                        , 'appname'
                        , 'poc'
                        , 'pocemail'
                        , 'lifetime'
                        , 'created'
                        , 'starttime')
                        .then((result) => {
                            expect(result.uid).to.equal(uid);
                            expect(result.appname).to.equal('app2');
                            expect(result.poc).to.equal('app2Name');
                            expect(result.pocemail).to.equal('app2Name@email.com');
                            expect(result.lifetime).to.equal('18m');
                            expect(result.created).to.match(/^[0-9]{13}/);
                            expect(result.starttime).to.match(/^[0-9]{13}/);
                            expect(result.starttime).to.equal(result.created);
                        });
                });
        });
        it('Get All Trusts return > 2', () => {
            let p1 = trustAccess.create_trust('app3','app3Name', 'app3Name@email.com', '18m');
            let p2 = trustAccess.create_trust('app4','app4Name', 'app4Name@email.com', '28m');
            let p3 = trustAccess.create_trust('app5','app5Name', 'app5Name@email.com', '38m');
            return Promise.all([p1, p2, p3])
                .then(() => {
                    return expect(trustAccess.retrieve_all_trusts()).to.eventually.have.length.above(2);
                });
        });
        it('Trust Updated (app2b) are correct', () => {
            let uid = '';
            return trustAccess.create_trust('app2a','app2aName', 'app2aName@email.com', '18m')
                .then((result) => {
                    uid = result;
                    return trustAccess.update_trust(uid, 'app2b', 'app2bName', 'app2bName@email.com', '20m')
                        .then(() => {
                            return expect(trustAccess.retrieve_trust(uid)).to.eventually.have.keys('uid'
                                , 'appname'
                                , 'poc'
                                , 'pocemail'
                                , 'lifetime'
                                , 'created'
                                , 'starttime')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.appname).to.equal('app2b');
                                    expect(result.poc).to.equal('app2bName');
                                    expect(result.pocemail).to.equal('app2bName@email.com');
                                    expect(result.lifetime).to.equal('20m');
                                    expect(result.created).to.match(/^[0-9]{13}/);
                                    expect(result.starttime).to.match(/^[0-9]{13}/);
                                    expect(result.starttime).to.equal(result.created);
                                });
                        });
                });
        });
        it('Trust Time Reset Updated (app2c) are correct', () => {
            let uid = '';
            return trustAccess.create_trust('app2c','app2cName', 'app2cName@email.com', '18m')
                .then((result) => {
                    uid = result;
                    return trustAccess.update_trust_lifetime(uid)
                        .then(() => {
                            return expect(trustAccess.retrieve_trust(uid)).to.eventually.have.keys('uid'
                                , 'appname'
                                , 'poc'
                                , 'pocemail'
                                , 'lifetime'
                                , 'created'
                                , 'starttime')
                                .then((result) => {
                                    expect(result.uid).to.equal(uid);
                                    expect(result.appname).to.equal('app2c');
                                    expect(result.poc).to.equal('app2cName');
                                    expect(result.pocemail).to.equal('app2cName@email.com');
                                    expect(result.lifetime).to.equal('18m');
                                    expect(result.created).to.match(/^[0-9]{13}/);
                                    expect(result.starttime).to.match(/^[0-9]{13}/);
                                    expect(result.starttime).to.not.equal(result.created);
                                });
                        });
                });
        });
        it('Delete Trust (app3a) should reject with not found', () => {
            let uid = '';
            return trustAccess.create_trust('app3a','app3aName', 'app3aName@email.com', '18m')
                .then((result) => {
                    uid = result;
                    return trustAccess.delete_trust(uid)
                        .then(() => {
                            return expect(trustAccess.get_trust_id('app3a')).to.eventually.rejectedWith('Trust for app3a not found.');
                        });
                });
        });
        it('Clear All Trusts return 0', () => {
            let p1 = trustAccess.create_trust('app31','app31Name', 'app31Name@email.com', '18m');
            let p2 = trustAccess.create_trust('app41','app41Name', 'app41Name@email.com', '28m');
            let p3 = trustAccess.create_trust('app51','app51Name', 'app51Name@email.com', '38m');
            return Promise.all([p1, p2, p3])
                .then(() => {
                    return trustAccess.clear_all_trusts()
                        .then(() => {
                            return expect(trustAccess.retrieve_all_trusts()).to.eventually.have.length(0);
                        });
                });
        });
    })
});