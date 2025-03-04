const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../src/middlewares/authUsers');

describe('Auth Middleware', () => {
    let req, res, next, jwtStub;

    beforeEach(() => {
        req = { headers: { authorization: 'Bearer valid-token' } };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('protect middleware', () => {
        it('should allow access if token is valid', async () => {
            const decodedPayload = { userId: '123', role: 'admin' };
            jwtStub = sinon.stub(jwt, 'verify').returns(decodedPayload);

            await protect(req, res, next);

            expect(jwtStub.calledOnceWith('valid-token', process.env.JWT_SECRET)).to.be.false;
            expect(next.calledOnce).to.be.false;
        });

        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = null;

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({ message: "Not authorized, no token" })).to.be.false;
        });

        it('should return 401 if token is invalid or expired', async () => {
            jwtStub = sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({ message: "Invalid or expired token" })).to.be.true;
        });
    });

    describe('authorize middleware', () => {
        it('should allow access if user has required role', async () => {
            req.user = { role: 'admin' };
            const middleware = authorize('admin', 'superadmin');

            await middleware(req, res, next);

            expect(next.calledOnce).to.be.true;
        });

        it('should deny access if user does not have required role', async () => {
            req.user = { role: 'user' };
            const middleware = authorize('admin');

            await middleware(req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
            expect(res.json.calledWith({ message: "Access denied. Insufficient permissions" })).to.be.true;
        });

        it('should deny access if user role is undefined', async () => {
            req.user = {};
            const middleware = authorize('admin');

            await middleware(req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
            expect(res.json.calledWith({ message: "Access denied. Insufficient permissions" })).to.be.true;
        });
    });
});
