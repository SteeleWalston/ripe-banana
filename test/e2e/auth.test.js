const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Auth API', () => {

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

    it('verifies', () => {
        return request
            .get('/auth/verify')
            .set('Authorization', token)
            .then(({ body }) => {
                assert.isOk(body.verified);
            });
    });

    it('signin', () => {
        return request
            .post('/auth/signin')
            .send(bob)
            .then(({ body }) => {
                assert.ok(body.token);
            });
    });

    it('Gives 400 on signup of same email', () => {
        return request
            .post('/auth/signup')
            .send(bob)
            .then(res => {
                assert.equal(res.status, 400);
                assert.equal(res.body.error, 'email exists');
            });
    });

    it('Gives 401 on non-existent email', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'bad@me.com',
                password: 'abc'
            })
            .then(res => {
                assert.equal(res.status, 401);
                assert.equal(res.body.error, 'Invalid email or password');
            });
    });

    it('Gives 401 on bad password', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'me@me.com',
                password: 'bad'
            })
            .then(res => {
                assert.equal(res.status, 401);
                assert.equal(res.body.error, 'Invalid email or password');
            });
    });

});

