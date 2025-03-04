const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { validationUser } = require('../src/middlewares/protected');

describe('validationUser Middleware', () => {
    let req, res, next, jwtStub;

    beforeEach(() => {
        req = {
            header: sinon.stub().withArgs('Authorization').returns('Bearer valid-token')
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should authenticate user when a valid token is provided', async () => {
        const decodedPayload = { userId: '123', role: 'user' };
        jwtStub = sinon.stub(jwt, 'verify').resolves(decodedPayload);

        await validationUser(req, res, next);

        expect(jwtStub.calledOnceWith('valid-token', process.env.JWT_SECRET)).to.be.true;
        expect(req.user).to.deep.equal(decodedPayload);
        expect(next.calledOnce).to.be.true;
    });

    it('should return 401 if token is missing', async () => {
        req.header = sinon.stub().withArgs('Authorization').returns(null);

        await validationUser(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ msg: 'No token, authorization denied' })).to.be.false;
    });

    it('should return 401 if token is invalid', async () => {
        jwtStub = sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

        await validationUser(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ msg: 'Token is not valid' })).to.be.true;
    });
});
