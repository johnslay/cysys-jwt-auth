process.env.NODE_CONFIG_DIR = "./test/config";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const logger = require('./mocks/mock_logger')();
const config = require('config');
const passwd = config.Controls.Password;
const passC = require('../src/passComplexity')(passwd, logger);

describe('passComplexity Tests', () => {
    "use strict";
    const pass0 = "";
    const pass4 = "1234";
    const pass9 = "123456789";
    const pass14 = "12345678901234";
    const pass20 = "12345678901234567890";
    const pass24 = "123456789012345678901234";
    const passUcase0 = "abcd123";
    const passUcase1 = "abcD123";
    const passUcase2 = "abCD123";
    const passUcase3 = "aBCD123";
    const passUcase4 = "ABCD123";
    const passUcase26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123";
    const passLcase0 = "ABCD123";
    const passLcase1 = "aBCD123";
    const passLcase2 = "abCD123";
    const passLcase3 = "abcD123";
    const passLcase4 = "abcd123";
    const passLcase26 = "abcdefghijklmnopqrstuvwxyz123";
    const passNumber0 = "ABCD";
    const passNumber1 = "aBCD1";
    const passNumber2 = "abCD12";
    const passNumber3 = "abcD123";
    const passNumber4 = "abcd1234";
    const passNumber10 = "abcd0123456789";
    const passSpec0 = 'abcd';
    const passSpec1 = 'abcd~';
    const passSpec2 = 'abcd~~';
    const passSpec3 = 'abcd~~~';
    const passSpec4 = 'abcd~~~~';
    const passSpec10 = 'abcd~~~~~~~~~~';
    const passSpeca = "~~~~";
    const passSpecb = "````";
    const passSpecc = "!!!!";
    const passSpecd = "@@@@";
    const passSpece = "####";
    const passSpecf = "$$$$";
    const passSpecg = "%%%%";
    const passSpech = "^^^^";
    const passSpeci = "&&&&";
    const passSpecj = "****";
    const passSpeck = "((((";
    const passSpecl = "))))";
    const passSpecm = "----";
    const passSpecn = "____";
    const passSpeco = "====";
    const passSpecp = "++++";
    const passSpecq = "{{{{";
    const passSpecr = "[[[[";
    const passSpecs = "}}}}";
    const passSpect = "]]]]";
    const passSpecu = "||||";
    const passSpecv = "\\\\\\\\";
    const passSpecw = "::::";
    const passSpecx = ";;;;";
    const passSpecy = "\"\"\"\"";
    const passSpecz = "\'\'\'\'";
    const passSpecaa = "<<<<";
    const passSpecab = ">>>>";
    const passSpecac = ",,,,";
    const passSpecad = "....";
    const passSpecae = "????";
    const passSpecaf = "////";
    const passSpecag = "    ";
    const passSeq0 = "1a2b3c4d";
    const passSeq1 = "12a3b4c5";
    const passSeq3 = "1abc2d3e4";
    const passSeq4 = "1234ajhfg";
    const passSeq5 = "12345ajhfg";
    const passSeq10 = "abcdefghij";
    const passSeqReverse5 = "54321ajhfg";
    const passSeqReverse10 = "jihgfedcba";
    const passQwerty0 = "1a2b3c4d";
    const passQwerty1 = "qwnr564";
    const passQwerty3 = "asdyjrrthu4356";
    const passQwerty4 = "zxcv4hrtur";
    const passQwerty10 = "qwerasdfzx";
    const passQwertyReverse4 = "rutrh4vcxz";
    const passQwertyReverse10 = "xzfdsarewq";
    const passPat0 = "1drgscfthw573";
    const passPat1 = "1qdryu7jk";
    const passPat3 = "@WSdsf63j76";
    const passPat4 = "5tgbj438dxsj";
    const passPat12 = "@WSX5tgb*IK<";
    const passPatReverse4 = "jsxd834jbgt5";
    const passPatReverse12 = "<KI*bgt5XSW@";
    const passPata0 = "2f5her8tyg";
    const passPata1 = "!#s5G79Eghu";
    const passPata3 = "14qg0$ceu%3";
    const passPata4 = "$^RYf82S2u57kjl";
    const passPata16 = "^*YIHKN<35etdgcb";
    const passPatReversea4 = "ljk75u2S28fYR^$";
    const passPatReversea16 = "bcgdte53<NKHIY*^";
    const passUName = "team.overwatch@email.com";
    const passUPassMatch = "team.overwatch@email.com";
    const passUPassNoMatch = "okalnd@email.com";
    const passDictMatch = "hagiographical";
    const passDictNoMatch = "lnrtq4qljf@#wDF@%324";
    const passGood = "MVZmvz159@^(MVZmvz159@^(";
    describe('Private Tests', () => {
        it('User Pass Should Fail Length 0', () => {
            return expect(passC.__testing__.check_pass_length(pass0))
                .to.be.rejectedWith('User Password is too short');
        });
        it('User Pass Should Fail Length 4', () => {
            return expect(passC.__testing__.check_pass_length(pass4))
                .to.be.rejectedWith('User Password is too short');
        });
        it('User Pass Should Fail Length 9', () => {
            return expect(passC.__testing__.check_pass_length(pass9))
                .to.be.rejectedWith('User Password is too short');
        });
        it('User Pass Should Pass Length 14', () => {
            return expect(passC.__testing__.check_pass_length(pass14))
                .to.eventually.equal(pass14);
        });
        it('User Pass Should Pass Length 20', () => {
            return expect(passC.__testing__.check_pass_length(pass20))
                .to.eventually.equal(pass20);
        });
        it('Admin Pass Should Fail Length 0', () => {
            return expect(passC.__testing__.check_admin_pass_length(pass0))
                .to.be.rejectedWith('Admin Password is too short');
        });
        it('Admin Pass Should Fail Length 9', () => {
            return expect(passC.__testing__.check_admin_pass_length(pass9))
                .to.be.rejectedWith('Admin Password is too short');
        });
        it('Admin Pass Should Pass Length 20', () => {
            return expect(passC.__testing__.check_admin_pass_length(pass20))
                .to.eventually.equal(pass20);
        });
        it('Admin Pass Should Pass Length 24', () => {
            return expect(passC.__testing__.check_admin_pass_length(pass24))
                .to.eventually.equal(pass24);
        });
        it('Password Upper Case Should Fail 0', () => {
            return expect(passC.__testing__.check_upper_case(passUcase0))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.upperCount + ' upper case characters required.');
        });
        it('Password Upper Case Should Fail 1', () => {
            return expect(passC.__testing__.check_upper_case(passUcase1))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.upperCount + ' upper case characters required.');
        });
        it('Password Upper Case Should Fail 2', () => {
            return expect(passC.__testing__.check_upper_case(passUcase2))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.upperCount + ' upper case characters required.');
        });
        it('Password Upper Case Should Pass 3', () => {
            return expect(passC.__testing__.check_upper_case(passUcase3))
                .to.eventually.equal(passUcase3);
        });
        it('Password Upper Case Should Pass 4', () => {
            return expect(passC.__testing__.check_upper_case(passUcase4))
                .to.eventually.equal(passUcase4);
        });
        it('Password Upper Case Should Pass 26', () => {
            return expect(passC.__testing__.check_upper_case(passUcase26))
                .to.eventually.equal(passUcase26);
        });
        it('Password Lower Case Should Fail 0', () => {
            return expect(passC.__testing__.check_lower_case(passLcase0))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.lowerCount + ' lower case characters required.');
        });
        it('Password Lower Case Should Fail 1', () => {
            return expect(passC.__testing__.check_lower_case(passLcase1))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.lowerCount + ' lower case characters required.');
        });
        it('Password Lower Case Should Fail 2', () => {
            return expect(passC.__testing__.check_lower_case(passLcase2))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.lowerCount + ' lower case characters required.');
        });
        it('Password Lower Case Should Pass 3', () => {
            return expect(passC.__testing__.check_lower_case(passLcase3))
                .to.eventually.equal(passLcase3);
        });
        it('Password Lower Case Should Pass 4', () => {
            return expect(passC.__testing__.check_lower_case(passLcase4))
                .to.eventually.equal(passLcase4);
        });
        it('Password Lower Case Should Pass 26', () => {
            return expect(passC.__testing__.check_lower_case(passLcase26))
                .to.eventually.equal(passLcase26);
        });
        it('Password Number Should Fail 0', () => {
            return expect(passC.__testing__.check_number(passNumber0))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.numberCount + ' numbers required.');
        });
        it('Password Number Should Fail 1', () => {
            return expect(passC.__testing__.check_number(passNumber1))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.numberCount + ' numbers required.');
        });
        it('Password Number Should Fail 2', () => {
            return expect(passC.__testing__.check_number(passNumber2))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.numberCount + ' numbers required.');
        });
        it('Password Number Should Pass 3', () => {
            return expect(passC.__testing__.check_number(passNumber3))
                .to.eventually.equal(passNumber3);
        });
        it('Password Number Should Pass 4', () => {
            return expect(passC.__testing__.check_number(passNumber4))
                .to.eventually.equal(passNumber4);
        });
        it('Password Number Should Pass 10', () => {
            return expect(passC.__testing__.check_number(passNumber10))
                .to.eventually.equal(passNumber10);
        });
        it('Password Special ' + passSpeca + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpeca))
                .to.eventually.equal(passSpeca);
        });
        it('Password Special ' + passSpecb + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecb))
                .to.eventually.equal(passSpecb);
        });
        it('Password Special ' + passSpecc + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecc))
                .to.eventually.equal(passSpecc);
        });
        it('Password Special ' + passSpecd + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecd))
                .to.eventually.equal(passSpecd);
        });
        it('Password Special ' + passSpece + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpece))
                .to.eventually.equal(passSpece);
        });
        it('Password Special ' + passSpecf + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecf))
                .to.eventually.equal(passSpecf);
        });
        it('Password Special ' + passSpecg + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecg))
                .to.eventually.equal(passSpecg);
        });
        it('Password Special ' + passSpech + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpech))
                .to.eventually.equal(passSpech);
        });
        it('Password Special ' + passSpeci + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpeci))
                .to.eventually.equal(passSpeci);
        });
        it('Password Special ' + passSpecj + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecj))
                .to.eventually.equal(passSpecj);
        });
        it('Password Special ' + passSpeck + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpeck))
                .to.eventually.equal(passSpeck);
        });
        it('Password Special ' + passSpecl + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecl))
                .to.eventually.equal(passSpecl);
        });
        it('Password Special ' + passSpecm + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecm))
                .to.eventually.equal(passSpecm);
        });
        it('Password Special ' + passSpecn + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecn))
                .to.eventually.equal(passSpecn);
        });
        it('Password Special ' + passSpeco + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpeco))
                .to.eventually.equal(passSpeco);
        });
        it('Password Special ' + passSpecp + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecp))
                .to.eventually.equal(passSpecp);
        });
        it('Password Special ' + passSpecq + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecq))
                .to.eventually.equal(passSpecq);
        });
        it('Password Special ' + passSpecr + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecr))
                .to.eventually.equal(passSpecr);
        });
        it('Password Special ' + passSpecs + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecs))
                .to.eventually.equal(passSpecs);
        });
        it('Password Special ' + passSpect + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpect))
                .to.eventually.equal(passSpect);
        });
        it('Password Special ' + passSpecu + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecu))
                .to.eventually.equal(passSpecu);
        });
        it('Password Special ' + passSpecv + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecv))
                .to.eventually.equal(passSpecv);
        });
        it('Password Special ' + passSpecw + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecw))
                .to.eventually.equal(passSpecw);
        });
        it('Password Special ' + passSpecx + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecx))
                .to.eventually.equal(passSpecx);
        });
        it('Password Special ' + passSpecy + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecy))
                .to.eventually.equal(passSpecy);
        });
        it('Password Special ' + passSpecz + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecz))
                .to.eventually.equal(passSpecz);
        });
        it('Password Special ' + passSpecaa + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecaa))
                .to.eventually.equal(passSpecaa);
        });
        it('Password Special ' + passSpecab + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecab))
                .to.eventually.equal(passSpecab);
        });
        it('Password Special ' + passSpecac + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecac))
                .to.eventually.equal(passSpecac);
        });
        it('Password Special ' + passSpecad + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecad))
                .to.eventually.equal(passSpecad);
        });
        it('Password Special ' + passSpecae + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecae))
                .to.eventually.equal(passSpecae);
        });
        it('Password Special ' + passSpecaf + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecaf))
                .to.eventually.equal(passSpecaf);
        });
        it('Password Special ' + passSpecag + ' Pass', () => {
            return expect(passC.__testing__.check_special(passSpecag))
                .to.eventually.equal(passSpecag);
        });
        it('Password Special Should Fail 0', () => {
            return expect(passC.__testing__.check_special(passSpec0))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.specialCount + ' special characters required.');
        });
        it('Password Special Should Fail 1', () => {
            return expect(passC.__testing__.check_special(passSpec1))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.specialCount + ' special characters required.');
        });
        it('Password Special Should Fail 2', () => {
            return expect(passC.__testing__.check_special(passSpec2))
                .to.be.rejectedWith('At least ' + passwd.PasswordComplexity.specialCount + ' special characters required.');
        });
        it('Password Special Should Pass 3', () => {
            return expect(passC.__testing__.check_special(passSpec3))
                .to.eventually.equal(passSpec3);
        });
        it('Password Special Should Pass 4', () => {
            return expect(passC.__testing__.check_special(passSpec4))
                .to.eventually.equal(passSpec4);
        });
        it('Password Special Should Pass 10', () => {
            return expect(passC.__testing__.check_special(passSpec10))
                .to.eventually.equal(passSpec10);
        });
        it('Password Sequence Should Fail 5', () => {
            return expect(passC.__testing__.check_sequence(passSeq5))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.sequenceCount + ' characters in sequence allowed.');
        });
        it('Password Sequence Should Fail 10', () => {
            return expect(passC.__testing__.check_sequence(passSeq10))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.sequenceCount + ' characters in sequence allowed.');
        });
        it('Password Sequence Reverse Should Fail 5', () => {
            return expect(passC.__testing__.check_sequence(passSeqReverse5))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.sequenceCount + ' characters in sequence allowed.');
        });
        it('Password Sequence Reverse Should Fail 10', () => {
            return expect(passC.__testing__.check_sequence(passSeqReverse10))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.sequenceCount + ' characters in sequence allowed.');
        });
        it('Password Sequence Should Pass 0', () => {
            return expect(passC.__testing__.check_sequence(passSeq0))
                .to.eventually.equal(passSeq0);
        });
        it('Password Sequence Should Pass 1', () => {
            return expect(passC.__testing__.check_sequence(passSeq1))
                .to.eventually.equal(passSeq1);
        });
        it('Password Sequence Should Pass 3', () => {
            return expect(passC.__testing__.check_sequence(passSeq3))
                .to.eventually.equal(passSeq3);
        });
        it('Password Sequence Should Pass 4', () => {
            return expect(passC.__testing__.check_sequence(passSeq4))
                .to.eventually.equal(passSeq4);
        });
        it('Password Qwerty Should Fail 4', () => {
            return expect(passC.__testing__.check_qwerty(passQwerty4))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.qwertyCount + ' qwerty characters in sequence allowed.');
        });
        it('Password Qwerty Should Fail 10', () => {
            return expect(passC.__testing__.check_qwerty(passQwerty10))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.qwertyCount + ' qwerty characters in sequence allowed.');
        });
        it('Password Qwerty Reverse Should Fail 4', () => {
            return expect(passC.__testing__.check_qwerty(passQwertyReverse4))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.qwertyCount + ' qwerty characters in sequence allowed.');
        });
        it('Password Qwerty Reverse Should Fail 10', () => {
            return expect(passC.__testing__.check_qwerty(passQwertyReverse10))
                .to.be.rejectedWith('No More than ' + passwd.PasswordComplexity.qwertyCount + ' qwerty characters in sequence allowed.');
        });
        it('Password Qwerty Should Pass 0', () => {
            return expect(passC.__testing__.check_qwerty(passQwerty0))
                .to.eventually.equal(passQwerty0);
        });
        it('Password Qwerty Should Pass 1', () => {
            return expect(passC.__testing__.check_qwerty(passQwerty1))
                .to.eventually.equal(passQwerty1);
        });
        it('Password Qwerty Should Pass 3', () => {
            return expect(passC.__testing__.check_qwerty(passQwerty3))
                .to.eventually.equal(passQwerty3);
        });
        it('Password Pattern Should Fail 4', () => {
            return expect(passC.__testing__.check_pattern(passPat4))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password Pattern Should Fail 12', () => {
            return expect(passC.__testing__.check_pattern(passPat12))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password Pattern Reverse Should Fail 4', () => {
            return expect(passC.__testing__.check_pattern(passPatReverse4))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password Pattern Reverse Should Fail 12', () => {
            return expect(passC.__testing__.check_pattern(passPatReverse12))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password Pattern Should Pass 0', () => {
            return expect(passC.__testing__.check_pattern(passPat0))
                .to.eventually.equal(passPat0);
        });
        it('Password Pattern Should Pass 1', () => {
            return expect(passC.__testing__.check_pattern(passPat1))
                .to.eventually.equal(passPat1);
        });
        it('Password Pattern Should Pass 3', () => {
            return expect(passC.__testing__.check_pattern(passPat3))
                .to.eventually.equal(passPat3);
        });
        it('Password PatternA Should Fail 4', () => {
            return expect(passC.__testing__.check_pattern(passPata4))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password PatternA Should Fail 16', () => {
            return expect(passC.__testing__.check_pattern(passPata16))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password PatternA Reverse Should Fail 4', () => {
            return expect(passC.__testing__.check_pattern(passPatReversea4))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password PatternA Reverse Should Fail 16', () => {
            return expect(passC.__testing__.check_pattern(passPatReversea16))
                .to.be.rejectedWith('Cannot use keyboard pattern');
        });
        it('Password PatternA Should Pass 0', () => {
            return expect(passC.__testing__.check_pattern(passPata0))
                .to.eventually.equal(passPata0);
        });
        it('Password PatternA Should Pass 1', () => {
            return expect(passC.__testing__.check_pattern(passPata1))
                .to.eventually.equal(passPata1);
        });
        it('Password PatternA Should Pass 3', () => {
            return expect(passC.__testing__.check_pattern(passPata3))
                .to.eventually.equal(passPata3);
        });
        it('Password User Name Should Fail', () => {
            return expect(passC.__testing__.check_username(passUPassMatch, passUName))
                .to.be.rejectedWith('Password cannot match username.');
        });
        it('Password Not User Name Should Pass', () => {
            return expect(passC.__testing__.check_username(passUPassNoMatch, passUName))
                .to.eventually.equal(passUPassNoMatch);
        });
        it('Password Dict Match Should Fail', () => {
            return expect(passC.__testing__.check_dictionary(passDictMatch))
                .to.be.rejectedWith('Password matches dictionary word.');
        });
        it('Password Not Not Dict Should Pass', () => {
            return expect(passC.__testing__.check_dictionary(passDictNoMatch))
                .to.eventually.equal(passDictNoMatch);
        });

    });
    describe('Public Tests', () => {
        it('Check Password Fail User Length', () => {
            return expect(passC.checkUserPassword(pass0,passUName))
                .to.be.rejectedWith('User Password is too short');
        });
        it('Check Password Fail Admin Length', () => {
            return expect(passC.checkAdminPassword(pass0,passUName))
                .to.be.rejectedWith('Admin Password is too short');
        });
        it('Check Password User Pass', () => {
            return expect(passC.checkUserPassword(passGood,passUName))
                .to.eventually.equal(passGood);
        });
        it('Check Password Admin Pass', () => {
            return expect(passC.checkAdminPassword(passGood,passUName))
                .to.eventually.equal(passGood);
        });
    });
});