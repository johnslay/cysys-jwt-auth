process.env.NODE_CONFIG_DIR = "./test/config";


const rnd = new Date().getTime().toString();
process.env.NODE_AUTHDB_PATH = './test/testdb/authdb' + rnd;
process.env.NODE_TRUSTEDDB_PATH = './test/testdb/trustdb' + rnd;


const app = require('../app');
const supertest = require('supertest')(app);
const expect = require('chai').expect;
const assert = require('assert');


describe('API Tests', () => {
    "use strict";
    let admin_token = '';

    describe('INIT Tests', () => {

        it("Get Route Responds with Account Does Not Exist", function (done) {
            supertest
                .get("/api/init")
                .expect(200)
                .expect({message: "Admin Account Does Not Exist"})
                .end(done);
        });

        it("Get Bad Route Responds with 400 error", function (done) {
            supertest
                .get("/api/init/abc")
                .expect(400)
                .end(done);
        });

        it("Empty Post Responds with 400 error", function (done) {
            supertest
                .post("/api/init")
                .set('Accept', 'application/json')
                .expect(400)
                .end(function (err, res) {
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Initialization');
                    expect(res.body.message).to.equal('Request must contain password element with the password to use');
                    done();
                });
        });

        it("Post Bad Pasword Responds with 400", function (done) {
            supertest
                .post("/api/init")
                .set('Accept', 'application/json')
                .send({
                    password: "EGBDF!"
                })
                .expect(400)
                .end(function (err, res) {
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Initialization');
                    expect(res.body.message).to.equal('Error creating admin account \'Admin Password is too short\'');
                    done();
                });
        });

        it("Post Responds with Account Created", function (done) {
            supertest
                .post("/api/init")
                .set('Accept', 'application/json')
                .send({
                    password: "EGBDF!$&egbdf147EGBDF!$&egbdf"
                })
                .expect(200)
                .expect({message: "Admin Account Created"})
                .end(done);
        });

    });

    describe('Batch Tests', () => {


        it("Post Responds with JWT", function (done) {
            let ttest = new RegExp('.\..\..');
            supertest
                .post("/api/auth")
                .set('Accept', 'application/json')
                .send({
                    user: "admin",
                    password: "EGBDF!$&egbdf147EGBDF!$&egbdf",
                    roles: ["A", "B", "C"]
                })
                .expect(200)
                .end(function(err, res){
                    admin_token = res.body.token;
                    assert(ttest.test(res.body.token));
                    done();
                })
        });

         it("Post Responds with Accounts and Trusts Created", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/batch")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({
                        "batch":
                            {
                                "defaultUserPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "defaultAdminPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "accounts": [
                                    {
                                        "uid": "12345678-a000-0000-0000-ab0123456789",
                                        "title": "SSgt1",
                                        "alias": "bubba",
                                        "firstName": "Bubba",
                                        "lastName": "Liscious",
                                        "emailAddress": "bubba@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt2",
                                        "alias": "holly",
                                        "firstName": "Holly",
                                        "lastName": "Happy",
                                        "emailAddress": "holly@email.com",
                                        "isAdmin": true
                                    },
                                    {
                                        "uid": "12345678-b000-0000-0000-ab0123456789",
                                        "title": "SSgt3",
                                        "alias": "sam",
                                        "firstName": "Sam",
                                        "lastName": "Houston",
                                        "emailAddress": "sam@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt4",
                                        "alias": "harold",
                                        "firstName": "Harold",
                                        "lastName": "Danose",
                                        "emailAddress": "harold@email.com",
                                        "isAdmin": true
                                    }
                                ],
                                "trusts": [
                                    {
                                        "uid": "12345678-c000-0000-0000-ab0123456789",
                                        "appname": "app1Name",
                                        "poc": "app1POC",
                                        "pocemail": "app1POC@email.com"
                                    },
                                    {
                                        "uid": "12345678-d000-0000-0000-ab0123456789",
                                        "appname": "app2Name",
                                        "poc": "app2POC",
                                        "pocemail": "app2POC@email.com",
                                        "lifetime": 30
                                    },
                                    {"appname": "app3Name", "poc": "app3POC", "pocemail": "app3POC@email.com"}
                                ]
                            }
                    }
                )
                .expect(200)
                .expect({ message: [ '4 user records added', '3 trust API Key records added' ] })
                .end(done);
        });

        it("Post Responds with Failed no admin password", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/batch")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({
                        "batch":
                            {
                                "defaultUserPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "accounts": [
                                    {
                                        "uid": "12345678-a000-0000-0000-ab0123456789",
                                        "title": "SSgt1",
                                        "alias": "bubba",
                                        "firstName": "Bubba",
                                        "lastName": "Liscious",
                                        "emailAddress": "bubba@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt2",
                                        "alias": "holly",
                                        "firstName": "Holly",
                                        "lastName": "Happy",
                                        "emailAddress": "holly@email.com",
                                        "isAdmin": true
                                    },
                                    {
                                        "uid": "12345678-b000-0000-0000-ab0123456789",
                                        "title": "SSgt3",
                                        "alias": "sam",
                                        "firstName": "Sam",
                                        "lastName": "Houston",
                                        "emailAddress": "sam@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt4",
                                        "alias": "harold",
                                        "firstName": "Harold",
                                        "lastName": "Danose",
                                        "emailAddress": "harold@email.com",
                                        "isAdmin": true
                                    }
                                ],
                                "trusts": [
                                    {
                                        "uid": "12345678-c000-0000-0000-ab0123456789",
                                        "appname": "app1Name",
                                        "poc": "app1POC",
                                        "pocemail": "app1POC@email.com"
                                    },
                                    {
                                        "uid": "12345678-d000-0000-0000-ab0123456789",
                                        "appname": "app2Name",
                                        "poc": "app2POC",
                                        "pocemail": "app2POC@email.com",
                                        "lifetime": 30
                                    },
                                    {"appname": "app3Name", "poc": "app3POC", "pocemail": "app3POC@email.com"}
                                ]
                            }
                    }
                )
                .expect(500)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Batch');
                    expect(res.body.message).to.equal('Batch failed. Last error: Batch Import Failed.  Check for malformed records or duplicate accounts/trusts');
                    done();
                });
        });

        it("Post Responds with Failed no user password", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/batch")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({
                        "batch":
                            {
                                "defaultAdminPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "accounts": [
                                    {
                                        "uid": "12345678-a000-0000-0000-ab0123456789",
                                        "title": "SSgt1",
                                        "alias": "bubba",
                                        "firstName": "Bubba",
                                        "lastName": "Liscious",
                                        "emailAddress": "bubba@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt2",
                                        "alias": "holly",
                                        "firstName": "Holly",
                                        "lastName": "Happy",
                                        "emailAddress": "holly@email.com",
                                        "isAdmin": true
                                    },
                                    {
                                        "uid": "12345678-b000-0000-0000-ab0123456789",
                                        "title": "SSgt3",
                                        "alias": "sam",
                                        "firstName": "Sam",
                                        "lastName": "Houston",
                                        "emailAddress": "sam@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt4",
                                        "alias": "harold",
                                        "firstName": "Harold",
                                        "lastName": "Danose",
                                        "emailAddress": "harold@email.com",
                                        "isAdmin": true
                                    }
                                ],
                                "trusts": [
                                    {
                                        "uid": "12345678-c000-0000-0000-ab0123456789",
                                        "appname": "app1Name",
                                        "poc": "app1POC",
                                        "pocemail": "app1POC@email.com"
                                    },
                                    {
                                        "uid": "12345678-d000-0000-0000-ab0123456789",
                                        "appname": "app2Name",
                                        "poc": "app2POC",
                                        "pocemail": "app2POC@email.com",
                                        "lifetime": 30
                                    },
                                    {"appname": "app3Name", "poc": "app3POC", "pocemail": "app3POC@email.com"}
                                ]
                            }
                    }
                )
                .expect(500)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Batch');
                    expect(res.body.message).to.equal('Batch failed. Last error: Batch Import Failed.  Check for malformed records or duplicate accounts/trusts');
                    done();
                });
        });

        it("Post Responds with Failed no user accounts and no trusts", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/batch")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({
                        "batch":
                            {
                                "defaultUserPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "defaultAdminPassword": "!$&EGBDF147egbdf!$&EGBDF"
                            }
                    }
                )
                .expect(500)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Batch');
                    expect(res.body.message).to.equal('Batch failed. Last error: Malformed Batch Request - cannot find accounts or trusts element');
                    done();
                });
        });

        it("Post Errors with Failed bad trust", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/batch")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({
                        "batch":
                            {
                                "defaultUserPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "defaultAdminPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "accounts": [
                                    {
                                        "uid": "12345678-a000-0000-0000-ab0123456789",
                                        "title": "SSgt1",
                                        "alias": "bubba",
                                        "firstName": "Bubba",
                                        "lastName": "Liscious",
                                        "emailAddress": "bubba@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt2",
                                        "alias": "holly",
                                        "firstName": "Holly",
                                        "lastName": "Happy",
                                        "emailAddress": "holly@email.com",
                                        "isAdmin": true
                                    },
                                    {
                                        "uid": "12345678-b000-0000-0000-ab0123456789",
                                        "title": "SSgt3",
                                        "alias": "sam",
                                        "firstName": "Sam",
                                        "lastName": "Houston",
                                        "emailAddress": "sam@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt4",
                                        "alias": "harold",
                                        "firstName": "Harold",
                                        "lastName": "Danose",
                                        "emailAddress": "harold@email.com",
                                        "isAdmin": true
                                    }
                                ],
                                "trusts": [
                                    {
                                        "uid": "12345678-c000-0000-0000-ab0123456789",
                                        "appname": "app1Name",
                                        "poc": "app1POC",
                                        "pocemail": "app1POC@email.com"
                                    },
                                    {
                                        "uid": "12345678-d000-0000-0000-ab0123456789",
                                        "appn2ame": "app2Name",
                                        "poc": "app2POC",
                                        "pocemail": "app2POC@email.com",
                                        "lifetime": 30
                                    },
                                    {"appname": "app3Name", "poc": "app3POC", "pocemail": "app3POC@email.com"}
                                ]
                            }
                    }
                )
                .expect(500)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Batch');
                    expect(res.body.message).to.equal('Batch failed. Last error: Batch Import Failed.  Check for malformed records or duplicate accounts/trusts');
                    done();
                });
        });

        it("Post Errors with Failed bad account", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/batch")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({
                        "batch":
                            {
                                "defaultUserPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "defaultAdminPassword": "!$&EGBDF147egbdf!$&EGBDF",
                                "accounts": [
                                    {
                                        "uid": "12345678-a000-0000-0000-ab0123456789",
                                        "title": "SSgt1",
                                        "alias": "bubba",
                                        "firstName": "Bubba",
                                        "lastName": "Liscious",
                                        "emailsAddress": "bubba@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt2",
                                        "alias": "holly",
                                        "firstName": "Holly",
                                        "lastName": "Happy",
                                        "emailAddress": "holly@email.com",
                                        "isAdmin": true
                                    },
                                    {
                                        "uid": "12345678-b000-0000-0000-ab0123456789",
                                        "title": "SSgt3",
                                        "alias": "sam",
                                        "firstName": "Sam",
                                        "lastName": "Houston",
                                        "emailAddress": "sam@email.com",
                                        "isAdmin": false
                                    },
                                    {
                                        "title": "SSgt4",
                                        "alias": "harold",
                                        "firstName": "Harold",
                                        "lastName": "Danose",
                                        "emailAddress": "harold@email.com",
                                        "isAdmin": true
                                    }
                                ],
                                "trusts": [
                                    {
                                        "uid": "12345678-c000-0000-0000-ab0123456789",
                                        "appname": "app1Name",
                                        "poc": "app1POC",
                                        "pocemail": "app1POC@email.com"
                                    },
                                    {
                                        "uid": "12345678-d000-0000-0000-ab0123456789",
                                        "appname": "app2Name",
                                        "poc": "app2POC",
                                        "pocemail": "app2POC@email.com",
                                        "lifetime": 30
                                    },
                                    {"appname": "app3Name", "poc": "app3POC", "pocemail": "app3POC@email.com"}
                                ]
                            }
                    }
                )
                .expect(500)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Batch');
                    expect(res.body.message).to.equal('Batch failed. Last error: Batch Import Failed.  Check for malformed records or duplicate accounts/trusts');
                    done();
                });
        });

    });

    describe('Trust Tests', () => {
        it("Get Route Responds with a list of trusts", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end( function(err, res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(0);
                    expect(res.body.records).to.length(0);
                    done();
                });
        });

        it("Post Trust Responds with Trust Created", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "trust": {
                        "appname": "app1",
                        "poc": "app1POC",
                        "pocemail": "app1POC@email.com"
                    }
                    }
                )
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("uid");
                    expect(res.body.message).to.equal('Trust \'app1\' created');
                    expect(res.body.uid).to.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
                    done();
                });
        });

        it("Post Trust Responds with Trust Created known UID", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "trust": {
                                    "appname": "app2",
                                    "poc": "app2POC",
                                    "pocemail": "app2POC@email.com",
                                    "uid": "12345678-0000-1000-0000-ab1234567890"
                                }
                    }
                )
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("uid");
                    expect(res.body.message).to.equal('Trust \'app2\' created');
                    expect(res.body.uid).to.equal('12345678-0000-1000-0000-ab1234567890');
                    done();
                });
        });

        it("Post Trust Bad Format Responds with 400", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "trust": {
                        "appsname": "app2",
                        "poc": "app2POC",
                        "pocemail": "app2POC@email.com",
                        "uid": "12345678-0000-1000-0000-ab1234567890"
                    }
                    }
                )
                .expect(400)
                .end(function (err, res) {
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Trusts');
                    expect(res.body.message).to.equal('App Name Required');
                    done();
                });
        });
        it("Get Route Responds with a list of 2 trusts", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end( function(err, res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(2);
                    expect(res.body.records).to.length(2);
                    done();
                });
        });

        it("Get Trust specific responds 200", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/trusts/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('trust');
                    expect(res.body.trust).to.have.property("uid");
                    expect(res.body.trust).to.have.property("appname");
                    expect(res.body.trust).to.have.property("poc");
                    expect(res.body.trust).to.have.property("pocemail");
                    expect(res.body.trust).to.have.property("created");
                    expect(res.body.trust).to.have.property("starttime");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.trust.uid).to.equal('12345678-0000-1000-0000-ab1234567890');
                    expect(res.body.trust.appname).to.equal('app2');
                    expect(res.body.trust.poc).to.equal('app2POC');
                    expect(res.body.trust.pocemail).to.equal('app2POC@email.com');
                    expect(res.body.trust.created).to.equal(res.body.trust.starttime);
                    done();
                });
        });

        it("Update Trust Bad Format Responds with 400", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .patch("/api/trusts/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "trust": {
                        "appsname": "app3",
                        "poc": "app3POC",
                        "pocemail": "app3POC@email.com"
                    }
                    }
                )
                .expect(400)
                .end(function (err, res) {
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Trusts');
                    expect(res.body.message).to.equal('Trust contains invalid field');
                    done();
                });
        });

        it("Update Trust Responds with 200", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .patch("/api/trusts/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "trust": {
                        "appname": "app3",
                        "poc": "app3POC",
                        "pocemail": "app3POC@email.com"
                    }
                    }
                )
                .expect(200)
                .expect({message: "Trust \'app3\' updated"})
                .end(done);
        });

        it("Reset Trust Lifetime Responds with 200", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .patch("/api/trusts/12345678-0000-1000-0000-ab1234567890?reset=true")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "trust": {
                        "appname": "app3",
                        "poc": "app3POC",
                        "pocemail": "app3POC@email.com"
                    }
                    }
                )
                .expect(200)
                .expect({message: "Trust \'12345678-0000-1000-0000-ab1234567890\' reset"})
                .end(done);
        });

        it("Check updates and lifetime on Trust responds 200", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/trusts/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('trust');
                    expect(res.body.trust).to.have.property("uid");
                    expect(res.body.trust).to.have.property("appname");
                    expect(res.body.trust).to.have.property("poc");
                    expect(res.body.trust).to.have.property("pocemail");
                    expect(res.body.trust).to.have.property("created");
                    expect(res.body.trust).to.have.property("starttime");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.trust.uid).to.equal('12345678-0000-1000-0000-ab1234567890');
                    expect(res.body.trust.appname).to.equal('app3');
                    expect(res.body.trust.poc).to.equal('app3POC');
                    expect(res.body.trust.pocemail).to.equal('app3POC@email.com');
                    expect(res.body.trust.created).to.not.equal(res.body.trust.starttime);
                    done();
                });
        });

        it("Fails to Delete trust with bad id 404", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .delete("/api/trusts/12345678-0000-1000-0000-ab123456789")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(404)
                .end(done);
        });

        it("Delete trust with success 200", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .delete("/api/trusts/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .expect({message: 'Trust \'12345678-0000-1000-0000-ab1234567890\' Deleted'})
                .end(done);
        });

        it("Delete all trusts with success 200", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .delete("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .expect({message: 'Trusts Deleted'})
                .end(done);
        });
        it("Verify Trusts Deleted", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/trusts")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end( function(err, res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(0);
                    expect(res.body.records).to.length(0);
                    done();
                });
        });
    });

    describe('User Tests', () => {
        it("Get Route Responds with a list of users zero", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function (err, res) {
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(0);
                    expect(res.body.records).to.length(0);
                    done();
                });
        });
        it("Post User Responds with User Created", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "user": {
                        "title":"Mr",
                        "alias":"Mr Wonderful",
                        "firstName":"Adam",
                        "lastName":"Arrow",
                        "emailAddress":"adam.arrow@email.com",
                        "isAdmin":false,
                        "password":"147egbdf!$&EGBDF147egbdf!$&EGBDF",
                        "mustReset":true,
                        "passwordExpires":true
                    }
                    }
                )
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("uid");
                    expect(res.body.message).to.equal('User \'adam.arrow@email.com\' created');
                    expect(res.body.uid).to.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
                    done();
                });
        });
        it("Post User with ID Responds with User Created", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "user": {
                        "uid":"12345678-0000-1000-0000-ab1234567890",
                        "title":"Mrs",
                        "alias":"Mrs Wonderful",
                        "firstName":"Alicia",
                        "lastName":"Arrow",
                        "emailAddress":"alicia.arrow@email.com",
                        "isAdmin":false,
                        "password":"147egbdf!$&EGBDF147egbdf!$&EGBDF",
                        "mustReset":true,
                        "passwordExpires":true
                    }
                    }
                )
                .expect(200)
                .end(function(err,res){
                    console.log(res.body.message);
                    console.log(res.body.uid);
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("uid");
                    expect(res.body.message).to.equal('User \'alicia.arrow@email.com\' created');
                    expect(res.body.uid).to.equal('12345678-0000-1000-0000-ab1234567890');
                    done();
                });
        });
        it("Verify Users exist count 2", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end( function(err, res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(2);
                    expect(res.body.records).to.length(2);
                    done();
                });
        });
        it("Verify User alicia exist", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property("uid");
                    expect(res.body.user).to.have.property("alias");
                    expect(res.body.user).to.have.property("username");
                    expect(res.body.user).to.have.property("title");
                    expect(res.body.user).to.have.property("first_name");
                    expect(res.body.user).to.have.property("last_name");
                    expect(res.body.user).to.have.property("email_address");
                    expect(res.body.user).to.have.property("locked");
                    expect(res.body.user).to.have.property("can_delete");
                    expect(res.body.user).to.have.property("must_reset");
                    expect(res.body.user).to.have.property("is_admin");
                    expect(res.body.user).to.have.property("last_login");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.user.uid).to.equal('12345678-0000-1000-0000-ab1234567890');
                    expect(res.body.user.alias).to.equal('Mrs Wonderful');
                    expect(res.body.user.first_name).to.equal('Alicia');
                    expect(res.body.user.last_name).to.equal('Arrow');
                    expect(res.body.user.username).to.equal('alicia.arrow@email.com');
                    expect(res.body.user.title).to.equal('Mrs');
                    expect(res.body.user.email_address).to.equal('alicia.arrow@email.com');
                    expect(res.body.user.locked).to.equal(false);
                    expect(res.body.user.can_delete).to.equal(true);
                    expect(res.body.user.must_reset).to.equal(true);
                    expect(res.body.user.is_admin).to.equal(false);
                    expect(res.body.user.last_login).to.be.a('number');
                    done();
                });
        });
        it("Update User Alicia Responds with User updated", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .patch("/api/users/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "user": {
                        "title":"Mrs.",
                        "alias":"Mrs. Wonderful",
                        "firstName":"Alicia2",
                        "lastName":"Arrow2",
                        "emailAddress":"alicia2.arrow2@email.com",
                        "isAdmin":true,
                        "mustReset":false,
                        "passwordExpires":false
                    }
                    }
                )
                .expect(200)
                .end(function(err,res){
                    console.log(res.body.message);
                    console.log(res.body.uid);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal('User \'12345678-0000-1000-0000-ab1234567890\' updated');
                    done();
                });
        });
        it("Verify User alicia has been updated", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property('message');
                    expect(res.body).to.have.property('user');
                    expect(res.body.user).to.have.property("uid");
                    expect(res.body.user).to.have.property("alias");
                    expect(res.body.user).to.have.property("username");
                    expect(res.body.user).to.have.property("title");
                    expect(res.body.user).to.have.property("first_name");
                    expect(res.body.user).to.have.property("last_name");
                    expect(res.body.user).to.have.property("email_address");
                    expect(res.body.user).to.have.property("locked");
                    expect(res.body.user).to.have.property("can_delete");
                    expect(res.body.user).to.have.property("must_reset");
                    expect(res.body.user).to.have.property("is_admin");
                    expect(res.body.user).to.have.property("last_login");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.user.uid).to.equal('12345678-0000-1000-0000-ab1234567890');
                    expect(res.body.user.alias).to.equal('Mrs. Wonderful');
                    expect(res.body.user.first_name).to.equal('Alicia2');
                    expect(res.body.user.last_name).to.equal('Arrow2');
                    expect(res.body.user.username).to.equal('alicia.arrow@email.com');
                    expect(res.body.user.title).to.equal('Mrs.');
                    expect(res.body.user.email_address).to.equal('alicia2.arrow2@email.com');
                    expect(res.body.user.locked).to.equal(false);
                    expect(res.body.user.can_delete).to.equal(true);
                    expect(res.body.user.must_reset).to.equal(false);
                    expect(res.body.user.is_admin).to.equal(true);
                    expect(res.body.user.last_login).to.be.a('number');
                    done();
                });
        });
        it("Delete User Responds with User Deleted", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .delete("/api/users/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function(err,res){
                    expect(res.body.message).to.equal('User Deleted');
                    done();
                });
        });
        it("Verify User alicia has been deleted", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users/12345678-0000-1000-0000-ab1234567890")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(404)
                .end(function(err,res){
                    expect(res.body.message).to.equal('User not found');
                    done();
                });
        });
        it("Post User 2 Responds with User Created", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .post("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .send({ "user": {
                        "title":"Mr",
                        "alias":"Mr Wonderful2",
                        "firstName":"Adam2",
                        "lastName":"Arrow2",
                        "emailAddress":"adam2.arrow2@email.com",
                        "isAdmin":false,
                        "password":"147egbdf!$&EGBDF147egbdf!$&EGBDF",
                        "mustReset":true,
                        "passwordExpires":true
                    }
                    }
                )
                .expect(200)
                .end(function(err,res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("uid");
                    expect(res.body.message).to.equal('User \'adam2.arrow2@email.com\' created');
                    expect(res.body.uid).to.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
                    done();
                });
        });
        it("Verify Two Users exist count 2", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end( function(err, res){
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(2);
                    expect(res.body.records).to.length(2);
                    done();
                });
        });
        it("Delete All User Responds with Users Deleted", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .delete("/api/users/")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function(err,res){
                    expect(res.body.message).to.equal('Users Deleted');
                    done();
                });
        });
        it("Verify All Users Deleted", function (done) {
            let atoken = 'Bearer ' + admin_token;
            supertest
                .get("/api/users")
                .set('Accept', 'application/json')
                .set('authorization', atoken)
                .expect(200)
                .end(function (err, res) {
                    expect(res.body).to.have.property("message");
                    expect(res.body).to.have.property("count");
                    expect(res.body).to.have.property("records");
                    expect(res.body.message).to.equal('Success');
                    expect(res.body.count).to.equal(0);
                    expect(res.body.records).to.length(0);
                    done();
                });
        });
    });

    describe('Auth Tests', () => {

        it("Post Responds with JWT Admin Token", function (done) {
            let ttest = new RegExp('.\..\..');
            supertest
                .post("/api/auth")
                .set('Accept', 'application/json')
                .send({
                    user: "admin",
                    password: "EGBDF!$&egbdf147EGBDF!$&egbdf",
                    roles: ["A", "B", "C"]
                })
                .expect(200)
                .end(function(err, res){
                    assert(ttest.test(res.body.token));
                    done();
                })
        });

        it("Post Fails with Bad Password.", function (done) {
            supertest
                .post("/api/auth")
                .set('Accept', 'application/json')
                .send({
                    user: "admin",
                    password: "EGBDF!$&egbdf147EGBDF!$&egbd",
                    roles: ["A", "B", "C"]
                })
                .expect(400)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Authentication');
                    expect(res.body.message).to.equal('Authentication Failed');
                    done();
                });
        });

        it("Post Fails with No User", function (done) {
            supertest
                .post("/api/auth")
                .set('Accept', 'application/json')
                .send({
                    user: "adminbadname",
                    password: "EGBDF!$&egbdf147EGBDF!$&egbdf",
                    roles: ["A", "B", "C"]
                })
                .expect(400)
                .end( function(err, res){
                    expect(res.body).to.have.property("code");
                    expect(res.body).to.have.property("type");
                    expect(res.body).to.have.property("message");
                    expect(res.body.code).to.equal(400);
                    expect(res.body.type).to.equal('Authentication');
                    expect(res.body.message).to.equal('Authentication Failed');
                    done();
                });
        });

    });

});