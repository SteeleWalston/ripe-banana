const { assert } = require('chai');
const { verify } = require('../../lib/util/token-service');
const request = require('./request');
const { dropCollection, createToken } = require('./db');

describe('Reviewer e2e', () => {

    before(() => dropCollection('reviewers'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('films'));

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    // let token = '';
    // before(() => createToken().then(t => token = t));

    let donald = {
        name: 'Angry Donald',
        company: 'angrydonald.com',
        email: 'don@don.com',
        password: '12345',
        roles: ['admin']
    };

    let rob = {
        name: 'Angry Robert',
        company: 'angryrob.com',
        email: 'rob@rob.com',
        password: '123456',
        roles: ['admin']
    };

    let jeff = {
        name: 'Angry Jeff',
        company: 'angryjeff.com',
        email: 'jeff@jeff.com',
        password: '1234567',
        roles: ['admin']
    };

    let studio1 = {
        name: 'Miramax',
        address: {
            city: 'Hollywood',
            state: 'CA',
            country: 'USA'
        }
    };

    let actor1 = {
        name: 'Brad Pitt',
        dob: '1963-12-18',
        pob: 'Shawnee, OK'
    };

    let review1 = {
        rating: 4,
        reviewer: {},
        review: 'sweet film',
        film: {}
    };

    let film1 = {
        title: 'Brad Pitt movie',
        studio: {},
        released: 2000,
        cast: [{
            part: 'Cool guy',
            actor: {}
        }]
    };

    before(() => {
        return request.post('/auth/signup')
            .send(jeff)
            .then(({ body }) => {
                const id = verify(body.token).id;
                jeff._id = id;
            });
    });

    before(() => {
        return request.post('/auth/signup')
            .send(rob)
            .then(({ body }) => {
                const id = verify(body.token).id;
                rob._id = id;
            });
    });

    before(() => {
        return request.post('/studios')
            .send(studio1)
            .then(({ body }) => {
                studio1 = body;
            });
    });

    before(() => {
        return request.post('/actors')
            .send(actor1)
            .then(({ body }) => {
                actor1 = body;
            });
    });

    before(() => {
        film1.studio._id = studio1._id;
        film1.studio.name = studio1.name;
        film1.cast[0].actor._id = actor1._id;
        return request.post('/films')
            // .set('Authorization', token)
            .send(film1)
            .then(checkOk)
            .then(({ body }) => {
                film1 = body;
            });
    });



    before(() => {
        review1.reviewer = jeff._id;
        review1.film = film1._id;

        return request.post('/reviews')
            // .set('Authorization', token)
            .send(review1)
            .then(({ body }) => {
                review1 = body;
            });
    });

    it('saves a reviewer', () => {
        return request.post('/auth/signup')
            .send(donald)
            .then(({ body }) => {
                const id = verify(body.token).id;
                donald._id = id;
                assert.deepEqual(id, donald._id);
            });
    });

    it('gets reviewer by id snd returns reviews', () => {
        return request.get(`/reviewers/${jeff._id}`)
            .then(({ body }) => {
                assert.deepEqual(body, {
                    _id: jeff._id,
                    name: jeff.name,
                    company: jeff.company,
                    reviews: [{
                        _id: review1._id,
                        rating: review1.rating,
                        review: review1.review,
                        film: {
                            _id: film1._id,
                            title: film1.title
                        }
                    }]
                });
            });


    });

    const getFields = ({ _id, name, company }) => ({ _id, name, company });

    it('gets all reviewers', () => {
        return request.get('/reviewers')
            .then(({ body }) => {
                assert.deepEqual(body, [jeff, rob, donald].map(getFields));
            });
    });

});