const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe.only('Auth API', () => {

    beforeEach(() => dropCollection('reviewers'));

    let bob = {
        name: 'Bob',
        company: 'bob.bob',
        email: 'me@me.com',
        password: '1234'
    };

    let token = null;

    beforeEach(() => {
        return request
            .post('/auth/signup')
            .send(bob)
            .then(({ body }) => token = body.token);
    });

    it('signup', () => {
        assert.ok(token);
    });

    it('signin', () => {
        return request
            .post('/auth/signin')
            .send(bob)
            .then(({ body }) => {
                assert.ok(body.token);
            });
    });

});

