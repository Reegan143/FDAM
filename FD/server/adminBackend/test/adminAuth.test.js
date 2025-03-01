const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { validateAdmin, authorize } = require('../src/middlewares/adminAuth'); // Ensure correct path

const { expect } = chai;

describe('Auth Middleware Tests', () => {
    let req, res, next;
    let jwtStub;

    beforeEach(() => {
        req = {
            header: sinon.stub(),
            admin: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('validateAdmin', () => {
        it('should return 401 if no token is provided', async () => {
            req.header.returns(null);

            await validateAdmin(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({ message: "Not authorized, no token" })).to.be.true;
        });

        it('should return 401 if token is invalid', async () => {
            req.header.returns("Bearer invalidToken");
            jwtStub = sinon.stub(jwt, 'verify').throws(new Error("Invalid token"));

            await validateAdmin(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({ message: "Invalid or expired token" })).to.be.true;
        });

        it('should return 403 if user is not an admin', async () => {
            req.header.returns("Bearer validToken");
            jwtStub = sinon.stub(jwt, 'verify').returns({ role: 'user' });

            await validateAdmin(req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
            expect(res.json.calledWith({ message: "Access denied. Admins only" })).to.be.true;
        });

        it('should call next if token is valid and user is admin', async () => {
            req.header.returns("Bearer validToken");
            jwtStub = sinon.stub(jwt, 'verify').returns({ role: 'admin' });

            await validateAdmin(req, res, next);

            expect(next.calledOnce).to.be.true;
        });
    });

    describe('authorize', () => {
        it('should return 403 if user role is not authorized', () => {
            req.admin = { role: 'user' };

            const middleware = authorize('admin', 'superadmin');
            middleware(req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
            expect(res.json.calledWith({ message: "Access denied. Insufficient permissions" })).to.be.true;
        });

        it('should call next if user role is authorized', () => {
            req.admin = { role: 'admin' };

            const middleware = authorize('admin', 'superadmin');
            middleware(req, res, next);

            expect(next.calledOnce).to.be.true;
        });
    });
});
