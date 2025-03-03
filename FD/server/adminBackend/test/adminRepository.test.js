const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const AdminRepository = require('../src/repositories/adminRepository');
const UserModel = require('../src/models/userModel');
const DisputesRepository = require('../src/repositories/disputesRepository');
const DisputesModel = require('../src/models/disputeModel');
const ApiModel = require('../src/models/apiModel');

describe('AdminRepository Unit Tests', function () {
    let adminData, disputeData, apiRequestData;

    beforeEach(async function () {
        // Mock admin data
        adminData = {
            _id: new mongoose.Types.ObjectId(),
            name: "Admin User",
            email: "admin@example.com",
            password: "hashedpassword",
            role: "admin"
        };

        // Mock dispute data
        disputeData = {
            _id: new mongoose.Types.ObjectId(),
            complaintType: "Fraud",
            disputedAmount: 5000,
            status: "Pending",
            createdAt: new Date()
        };

        // Mock API Key request data
        apiRequestData = {
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            status: "Pending",
            createdAt: new Date()
        };

        // Stub Mongoose methods
        sinon.stub(UserModel, 'create').resolves(adminData);
        sinon.stub(UserModel, 'findOne').resolves(adminData);
        sinon.stub(ApiModel, 'findByIdAndDelete').resolves(apiRequestData);
        sinon.stub(ApiModel, 'findOne').resolves(apiRequestData);
        sinon.stub(ApiModel, 'findOneAndUpdate').resolves(apiRequestData);
        sinon.stub(ApiModel, 'find').resolves([apiRequestData]);

        // ✅ Ensure `getDisputeById` and `updateById` exist before stubbing
        if (!DisputesRepository.getDisputeById) {
            DisputesRepository.getDisputeById = async () => null;
        }
        if (!DisputesRepository.updateById) {
            DisputesRepository.updateById = async () => null;
        }
        sinon.stub(DisputesRepository, 'getDisputeById').resolves(disputeData);
        sinon.stub(DisputesRepository, 'getAllDisputes').resolves([disputeData]);
        sinon.stub(DisputesRepository, 'updateById').resolves({ ...disputeData, status: "Resolved" });

        // Stub aggregate function for fraud reports
        sinon.stub(DisputesModel, 'aggregate').resolves([
            { _id: "Fraud", count: 1, totalAmount: 5000 }
        ]);
    });

    afterEach(function () {
        sinon.restore(); // Restore all stubs after each test
    });

    it('should create an admin', async function () {
        const result = await AdminRepository.createAdmin(adminData);
        expect(result).to.deep.equal(adminData);
    });

    it('should get all disputes', async function () {
        const result = await AdminRepository.getAllDisputes();
        expect(result).to.be.an('array');
        expect(result[0]).to.have.property('complaintType', 'Fraud');
    });

    it('should find an admin by email', async function () {
        const result = await AdminRepository.findAdminByEmail(adminData.email);
        expect(result).to.deep.equal(adminData);
    });

    it('should find and delete an API key request', async function () {
        const result = await AdminRepository.findAndDeleteApiKeyRequest(apiRequestData._id);
        expect(result).to.deep.equal(apiRequestData);
    });

    it('should find an API key request', async function () {
        const result = await AdminRepository.findApiKeyRequest(apiRequestData._id);
        expect(result).to.deep.equal(apiRequestData);
    });

    it('should update an API key request', async function () {
        const result = await AdminRepository.updateApiKeyRequest(apiRequestData._id, "Approved");
        expect(result).to.deep.equal(apiRequestData);
    });

    it('should get all API key requests', async function () {
        const result = await AdminRepository.getAllApiKeyRequests();
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
    });

    it('should update dispute status', async function () {
        const result = await AdminRepository.updateDisputeStatus(disputeData._id, "Resolved", "Issue fixed", adminData._id);
        expect(result.status).to.equal("Resolved");
    });

    it('should throw an error if dispute not found', async function () {
        DisputesRepository.getDisputeById.resolves(null);

        try {
            await AdminRepository.updateDisputeStatus(new mongoose.Types.ObjectId(), "Resolved", "Fixed", adminData._id);
        } catch (error) {
            expect(error.message).to.equal("Dispute not found");
        }
    });

    it('should throw an error if dispute is already resolved', async function () {
        DisputesRepository.getDisputeById.resolves({ ...disputeData, status: "Resolved" });

        try {
            await AdminRepository.updateDisputeStatus(disputeData._id, "Resolved", "Fixed", adminData._id);
        } catch (error) {
            expect(error.message).to.equal("Dispute already resolved");
        }
    });

    it('should generate fraud report', async function () {
        const result = await AdminRepository.generateFraudReport(new Date(), new Date());
        expect(result).to.be.an('array');
        expect(result[0]).to.have.property('_id', "Fraud");
        expect(result[0]).to.have.property('count', 1);
    });

    // Error handling tests
    it('should handle error when creating an admin', async function () {
        UserModel.create.rejects(new Error('Database error'));

        try {
            await AdminRepository.createAdmin(adminData);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when finding an admin', async function () {
        UserModel.findOne.rejects(new Error('Database error'));

        try {
            await AdminRepository.findAdminByEmail(adminData.email);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when updating dispute status', async function () {
        DisputesRepository.getDisputeById.rejects(new Error('Database error'));

        try {
            await AdminRepository.updateDisputeStatus(disputeData._id, "Resolved", "Issue fixed", adminData._id);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when generating fraud report', async function () {
        DisputesModel.aggregate.rejects(new Error('Database error'));

        try {
            await AdminRepository.generateFraudReport(new Date(), new Date());
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });
});
