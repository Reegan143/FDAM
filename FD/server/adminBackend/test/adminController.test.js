const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const AdminController = require('../src/controllers/adminController');
const AdminService = require('../src/services/adminServices');

describe('AdminController Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            admin: { adminId: '12345', email: 'admin@test.com' },
            vendor: { email: 'vendor@test.com' }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getAllDisputes', () => {
        it('should return disputes', async () => {
            sinon.stub(AdminService, 'getAllDisputes').resolves([{ id: '1', status: 'pending' }]);

            await AdminController.getAllDisputes(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith([{ id: '1', status: 'pending' }])).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'getAllDisputes').rejects(new Error('Database error'));

            await AdminController.getAllDisputes(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Database error' })).to.be.true;
        });
    });

    describe('approveApiKeyRequest', () => {
        it('should approve an API key request', async () => {
            sinon.stub(AdminService, 'approveApiKeyRequest').resolves({ apiKey: 'test-api-key' });
            req.body = { requestId: 'req123', email: 'vendor@test.com', transactionId: 'trans123' };

            await AdminController.approveApiKeyRequest(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ apiKey: 'test-api-key' })).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'approveApiKeyRequest').rejects(new Error('Approval failed'));

            await AdminController.approveApiKeyRequest(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Approval failed' })).to.be.true;
        });
    });

    describe('rejectApiKeyRequest', () => {
        it('should reject an API key request successfully', async () => {
            sinon.stub(AdminService, 'rejectApiKeyRequest').resolves({ message: 'API Key rejected' });
            req.body = { requestId: 'req123' };

            await AdminController.rejectApiKeyRequest(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'API Key rejected' })).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'rejectApiKeyRequest').rejects(new Error('Rejection failed'));

            await AdminController.rejectApiKeyRequest(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Rejection failed' })).to.be.true;
        });
    });

    describe('getApiKeyRequests', () => {
        it('should return API key requests', async () => {
            sinon.stub(AdminService, 'getApiKeyRequests').resolves([{ requestId: '1', status: 'pending' }]);

            await AdminController.getApiKeyRequests(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith([{ requestId: '1', status: 'pending' }])).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'getApiKeyRequests').rejects(new Error('Failed to fetch requests'));

            await AdminController.getApiKeyRequests(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Failed to fetch requests' })).to.be.true;
        });
    });

    describe('getAdminByEmail', () => {
        it('should return an admin by email', async () => {
            sinon.stub(AdminService, 'getAdminByEmail').resolves({ email: 'admin@test.com' });

            await AdminController.getAdminByEmail(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ email: 'admin@test.com' })).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'getAdminByEmail').rejects(new Error('Admin not found'));

            await AdminController.getAdminByEmail(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Admin not found' })).to.be.true;
        });
    });

    describe('updateDisputeStatus', () => {
        it('should update dispute status successfully', async () => {
            sinon.stub(AdminService, 'updateDisputeStatus').resolves({ status: 'resolved' });
            req.body = { disputeId: '123', status: 'resolved', remarks: 'Verified' };

            await AdminController.updateDisputeStatus(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ status: 'resolved' })).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'updateDisputeStatus').rejects(new Error('Update failed'));

            await AdminController.updateDisputeStatus(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Update failed' })).to.be.true;
        });
    });

    describe('generateFraudReport', () => {
        it('should generate a fraud report', async () => {
            sinon.stub(AdminService, 'generateFraudReport').resolves({ report: 'Fraud detected' });
            req.body = { startDate: '2024-01-01', endDate: '2024-01-31' };

            await AdminController.generateFraudReport(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ report: 'Fraud detected' })).to.be.true;
        });

        it('should handle errors', async () => {
            sinon.stub(AdminService, 'generateFraudReport').rejects(new Error('Report generation failed'));

            await AdminController.generateFraudReport(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Report generation failed' })).to.be.true;
        });
    });
});
