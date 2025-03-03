const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { authenticateVendor } = require('../src/middlewares/authMiddleware');

describe('authenticateVendor Middleware', () => {
    let req, res, next, jwtStub;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer valid-token'
            }
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

    it('should authenticate vendor when a valid token is provided', async () => {
        const decodedPayload = { vendorId: '123', email: 'vendor@example.com' };
        jwtStub = sinon.stub(jwt, 'verify').resolves(decodedPayload);

        await authenticateVendor(req, res, next);

        expect(jwtStub.calledOnceWith('valid-token', process.env.JWT_SECRET)).to.be.true;
        expect(req.vendor).to.deep.equal(decodedPayload);
        expect(next.calledOnce).to.be.true;
    });

    it('should return 401 error if token is missing', async () => {
        req.headers.authorization = null;

        await authenticateVendor(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ error: 'Access denied. No valid token provided.' })).to.be.true;
    });

    it('should return 401 error if token is invalid', async () => {
        jwtStub = sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

        await authenticateVendor(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: 'Internal server error' })).to.be.true;
    });

    it('should return 401 error if token does not start with "Bearer "', async () => {
        req.headers.authorization = 'InvalidTokenFormat';

        await authenticateVendor(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ error: 'Access denied. No valid token provided.' })).to.be.true;
    });
});
