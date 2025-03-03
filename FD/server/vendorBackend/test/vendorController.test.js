const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const VendorController = require('../src/controllers/vendorController');
const VendorService = require('../src/services/vendorServices');

describe('VendorController Unit Tests', function () {
    let req, res;

    beforeEach(function () {
        //  Mock request & response objects
        req = {
            body: {},
            headers: {},
            vendor: { email: 'vendor@test.com', vendorName: 'TestVendor' }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('requestApiKey()', function () {
        it('should request an API key successfully', async function () {
            sinon.stub(VendorService, 'requestApiKey').resolves({ message: 'API Key request submitted' });

            req.body.transactionId = 'T123';
            await VendorController.requestApiKey(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, { message: 'API Key request submitted' });
        });

        it('should return an error if API key request fails', async function () {
            sinon.stub(VendorService, 'requestApiKey').rejects(new Error('Request failed'));

            req.body.transactionId = 'T123';
            await VendorController.requestApiKey(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, { error: 'Request failed' });
        });
    });

    describe('getVendorById()', function () {
        it('should get vendor details successfully', async function () {
            sinon.stub(VendorService, 'getVendorById').resolves({ vendorName: 'TestVendor' });

            await VendorController.getVendorById(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, { vendorName: 'TestVendor' });
        });

        it('should return an error if vendor retrieval fails', async function () {
            sinon.stub(VendorService, 'getVendorById').rejects(new Error('Vendor not found'));

            await VendorController.getVendorById(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, { error: 'Vendor not found' });
        });
    });

    describe('respondToDispute()', function () {
        it('should respond to a dispute successfully', async function () {
            sinon.stub(VendorService, 'respondToDispute').resolves({ disputeId: 'D123', vendorResponse: 'Accepted' });

            req.body = { disputeId: 'D123', vendorResponse: 'Accepted' };
            await VendorController.respondToDispute(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, { message: 'Vendor response recorded and email sent', dispute: { disputeId: 'D123', vendorResponse: 'Accepted' } });
        });

        it('should return an error if dispute response fails', async function () {
            sinon.stub(VendorService, 'respondToDispute').rejects(new Error('Dispute response failed'));

            req.body = { disputeId: 'D123', vendorResponse: 'Rejected' };
            await VendorController.respondToDispute(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, { error: 'Dispute response failed' });
        });
    });

    describe('getApiKey()', function () {
        it('should get API key successfully', async function () {
            sinon.stub(VendorService, 'getApiKey').resolves('fake-api-key');

            await VendorController.getApiKey(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, { apiKey: 'fake-api-key' });
        });

        it('should return an error if API key retrieval fails', async function () {
            sinon.stub(VendorService, 'getApiKey').rejects(new Error('API Key retrieval failed'));

            await VendorController.getApiKey(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, { error: 'API Key retrieval failed' });
        });
    });

    describe('decodeApiKey()', function () {
        it('should decode API key successfully', async function () {
            sinon.stub(VendorService, 'decodeApiKey').resolves({ decoded: 'decoded-key' });

            req.body.apiKey = 'fake-api-key';
            await VendorController.decodeApiKey(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, { message: 'API Key decoded successfully', decodedApiKey: { decoded: 'decoded-key' } });
        });

        it('should return an error if API key decoding fails', async function () {
            sinon.stub(VendorService, 'decodeApiKey').rejects(new Error('Invalid API Key'));

            req.body.apiKey = 'invalid-api-key';
            await VendorController.decodeApiKey(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, { error: 'Invalid API Key' });
        });
    });

    describe('fetchTransactionData()', function () {
        it('should fetch transaction data successfully', async function () {
            sinon.stub(VendorService, 'fetchTransactionData').resolves({ transactionId: 'T123', status: 'Completed' });

            req.body.transactionId = 'T123';
            req.headers.authorization = 'Bearer fake-token';
            await VendorController.fetchTransactionData(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, { message: 'Transaction Data Fetched', data: { transactionId: 'T123', status: 'Completed' } });
        });

        it('should return an error if transaction ID is missing', async function () {
            req.body.transactionId = null;
            await VendorController.fetchTransactionData(req, res);

            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledWith(res.json, { error: 'Transaction ID is required' });
        });

        it('should return an error if transaction data retrieval fails', async function () {
            sinon.stub(VendorService, 'fetchTransactionData').rejects(new Error('Transaction not found'));

            req.body.transactionId = 'T123';
            req.headers.authorization = 'Bearer fake-token';
            await VendorController.fetchTransactionData(req, res);

            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledWith(res.json, { error: 'Transaction not found' });
        });
    });
});
