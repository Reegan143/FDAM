const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { expect } = chai;
const { authenticateVendor } = require('../src/middlewares/authMiddleware');

describe("Vendor Authentication Middleware Tests", () => {
    
    let req, res, next;
    
    beforeEach(() => {
        req = { headers: { authorization: "Bearer valid_token" } };
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
        next = sinon.stub();
        process.env.JWT_SECRET = "test_secret";
    });

    afterEach(() => {
        sinon.restore();
    });

    //  Test authenticateVendor - Valid Token
    it("should authenticate vendor with a valid token", async () => {
        sinon.stub(jwt, "verify").returns({ vendorId: "12345", role: "vendor" });

        await authenticateVendor(req, res, next);

        expect(req.vendor.vendorId).to.equal("12345");
        expect(next.calledOnce).to.be.true;
    });

    //  Test authenticateVendor - Missing Token
    it("should return 401 if token is missing", async () => {
        req.headers.authorization = null;

        await authenticateVendor(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Access denied. No valid token provided." })).to.be.true;
    });

    // Test authenticateVendor - Invalid Token
    it("should return 401 if token is invalid", async () => {
        sinon.stub(jwt, "verify").throws(new Error("Invalid token"));

        await authenticateVendor(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Internal server error" })).to.be.true;
    });

    //  Test authenticateVendor - Token Without Bearer Prefix
    it("should return 401 if token is missing Bearer prefix", async () => {
        req.headers.authorization = "invalid_token";

        await authenticateVendor(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Access denied. No valid token provided." })).to.be.true;
    });
});
