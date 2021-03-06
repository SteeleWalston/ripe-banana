const { assert } = require('chai');
const request = require('./request');
const Reviewer = require('../../lib/models/Reviewer');
const { dropCollection } = require('./db');

describe('Reviewer e2e', () => {

    before(() => dropCollection('reviewers'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('films'));

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    let donald = {
        name: 'Angry Donald',
        company: 'angrydonald.com'
    };

    let rob = {
        name: 'Angry Robert',
        company: 'angryrob.com'
    };

    let jeff = {
        name: 'Angry Jeff',
        company: 'angryjeff.com'
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
        return request.post('/reviewers')
            .send(jeff)
            .then(({ body }) => {
                jeff = body;
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
            .send(review1)
            .then(({ body }) => {
                review1 = body;
            });
    });

    it('saves a reviewer', () => {
        return request.post('/reviewers')
            .send(donald)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.equal(__v, 0);
                assert.deepEqual(body, { _id, __v, ...donald }),
                donald = body;
            });
    });
    const roundTrip = doc => JSON.parse(JSON.stringify(doc.toJSON()));

    it('gets reviewer by id snd returns reviews', () => {
        return request.get(`/reviewers/${jeff._id}`)
            .then(({ body }) => {
                assert.deepEqual(body, {
                    _id: jeff._id,
                    __v: 0,
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

    it('gets reviewer by id', () => {
        return Reviewer.create(rob).then(roundTrip)
            .then(saved => {
                rob = saved;
                return request.get(`/reviewers/${rob._id}`);
            })
            .then(({ body }) => {
                assert.deepEqual(body, { 
                    ...rob, 
                    reviews: []
                });
            });
    });

    it('updates a reviewer', () => {
        rob.company = 'angryrobert.com';
        return request.put(`/reviewers/${rob._id}`)
            .send(rob)
            .then(({ body }) => {
                assert.deepEqual(body, rob);
                return Reviewer.findById(rob._id).then(roundTrip);
            })
            .then(updated => {
                assert.deepEqual(updated, rob);
            });
    });

    const getFields = ({ _id, name, company }) => ({ _id, name, company });

    it('gets all reviewers', () => {
        return request.get('/reviewers')
            .then(({ body }) => {
                assert.deepEqual(body, [jeff, donald, rob].map(getFields));
            });
    });

});