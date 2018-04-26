const { assert } = require('chai');
const createEnsureAuth = require('../../lib/util/ensure-auth');
const tokenService = require('../../lib/util/token-service');

describe.skip('ensure auth middleware', () => {

    const reviewer = { _id: 1234 };
    let token = '';
    beforeEach(() => token = tokenService.sign(reviewer));

    const ensureAuth = createEnsureAuth();

    it('adds payload as req.reviewer on success', done => {
        const req = {
            get(header) {
                if(header === 'Authorization') return token;
            }
        };

        const next = () => {
            assert.equal(req.reviewer.id, reviewer._id);
            done();
        };

        ensureAuth(req, null, next);
    });

});