const { assert } = require('chai');
const Reviewer = require('../../lib/models/Reviewer');
const { getErrors } = require('./helpers');

describe('Reviewer Model', () => {

    const data = {
        name: 'Angry Donald',
        company: 'angrydonald.com',
        email: 'me@me.com'
    };
    const password = 'abc';

    it('Valid good model', () => {

        const don = new Reviewer(data);
        data._id = don._id;

        assert.deepEqual(don.toJSON(), data);
    });

    it('required fields', () => {
        const reviewer = new Reviewer({});
        const errors = getErrors(reviewer.validateSync(), 4);
        assert.equal(errors.name.kind, 'required');
        assert.equal(errors.company.kind, 'required');
    });

    it('generates hash from password', () => {
        const reviewer = new Reviewer(data);
        reviewer.generateHash(password);
        assert.ok(reviewer.hash);
        assert.notEqual(reviewer.hash, password);
    });

    it('compares password to hash', () => {
        const reviewer = new Reviewer(data);
        reviewer.generateHash(password);
        assert.isOk(reviewer.comparePassword(password));
    });

});