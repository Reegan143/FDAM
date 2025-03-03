const { expect } = require('chai');
const sinon = require('sinon');
const DisputesController = require('../src/controllers/disputeController');
const DisputesService = require('../src/services/disputeServices');

describe('DisputesController', () => {
    let req, res, next, disputeStub;

    beforeEach(() => {
        req = { user: { email: 'user@example.com' }, body: {}, params: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.stub();
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('registerDispute', () => {
        it('should register a dispute successfully', async () => {
            const mockDispute = { ticketNumber: '654321' };
            disputeStub = sinon.stub(DisputesService, 'registerDispute').resolves(mockDispute);

            await DisputesController.registerDispute(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith({ message: 'Complaint registered successfully!', dispute: mockDispute })).to.be.true;
        });

        it('should handle errors when registering a dispute', async () => {
            disputeStub = sinon.stub(DisputesService, 'registerDispute').throws(new Error('Database error'));

            await DisputesController.registerDispute(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Database error' })).to.be.true;
        });
    });

    describe('getUserDisputes', () => {
        it('should return disputes for a user', async () => {
            const mockDisputes = [{ ticketNumber: '654321' }];
            disputeStub = sinon.stub(DisputesService, 'getUserDisputes').resolves(mockDisputes);

            await DisputesController.getUserDisputes(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(mockDisputes)).to.be.true;
        });

        it('should handle errors when fetching user disputes', async () => {
            disputeStub = sinon.stub(DisputesService, 'getUserDisputes').throws(new Error('Fetch failed'));

            await DisputesController.getUserDisputes(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Failed to fetch disputes' })).to.be.true;
        });
    });

    describe('getDisputeById', () => {
        it('should return a dispute by ticket number', async () => {
            req.body.ticketNumber = '654321';
            const mockDispute = { ticketNumber: '654321' };
            disputeStub = sinon.stub(DisputesService, 'getDisputeByTicketNumber').resolves(mockDispute);

            await DisputesController.getDisputeById(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(mockDispute)).to.be.true;
        });

        it('should handle errors when fetching dispute by ticket number', async () => {
            req.body.ticketNumber = '654321';
            disputeStub = sinon.stub(DisputesService, 'getDisputeByTicketNumber').throws(new Error('Not found'));

            await DisputesController.getDisputeById(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ error: 'Not found' })).to.be.true;
        });
    });

    describe('getDisputeByVendorName', () => {
        it('should return disputes for a vendor', async () => {
            req.params.vendorName = 'Amazon';
            const mockDisputes = [{ vendorName: 'Amazon', ticketNumber: '654321' }];
            disputeStub = sinon.stub(DisputesService, 'getDisputeByVendorName').resolves(mockDisputes);

            await DisputesController.getDisputeByVendorName(req, res);

            expect(res.json.calledWith(mockDisputes)).to.be.true;
        });

        it('should handle errors when fetching disputes by vendor name', async () => {
            req.params.vendorName = 'Amazon';
            disputeStub = sinon.stub(DisputesService, 'getDisputeByVendorName').throws(new Error('Server error'));

            await DisputesController.getDisputeByVendorName(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Server error' })).to.be.true;
        });
    });
});
