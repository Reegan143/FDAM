const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const VendorRepository = require('../src/repositories/vendorRepository');
const VendorModel = require('../src/models/vendorModel');
const DisputesModel = require('../src/models/disputeModel');
const NotificationModel = require('../src/models/noticationModel');
const UserModel = require('../src/models/userModel');
const ApiModel = require('../src/models/apiModel');

describe('VendorRepository Unit Tests', function () {
    let vendorData, apiData, disputeData, notificationData;

    beforeEach(function () {
        vendorData = {
            _id: new mongoose.Types.ObjectId(),
            vendorName: "TestVendor",
            email: "vendor@example.com",
            role: "vendor",
            apiKey: "test-api-key"
        };

        apiData = {
            _id: new mongoose.Types.ObjectId(),
            transactionId: "TXN12345",
            apiKey: "generated-key",
            status: "pending"
        };

        disputeData = {
            _id: new mongoose.Types.ObjectId(),
            ticketNumber: "D123",
            complaintType: "Fraud",
            disputedAmount: 5000,
            status: "Pending"
        };

        notificationData = {
            _id: new mongoose.Types.ObjectId(),
            email: "vendor@example.com",
            message: "Test notification"
        };

        sinon.stub(ApiModel, 'create').resolves(apiData);
        sinon.stub(ApiModel, 'find').resolves([apiData]);
        sinon.stub(UserModel, 'find').resolves([vendorData]);
        sinon.stub(UserModel, 'findOne');
        sinon.stub(VendorModel, 'findOneAndUpdate').resolves(vendorData);
        sinon.stub(DisputesModel, 'findById').resolves(disputeData);
        sinon.stub(NotificationModel, 'create').resolves(notificationData);
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('createApiKeyRequest()', function () {
        it('should create an API key request', async function () {
            const result = await VendorRepository.createApiKeyRequest(apiData);
            expect(result).to.deep.equal(apiData);
        });

        it('should handle errors when creating an API key request', async function () {
            ApiModel.create.rejects(new Error('Database error'));

            try {
                await VendorRepository.createApiKeyRequest(apiData);
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('findApiKeyRequestByTransactionId()', function () {
        it('should find API key request by transaction ID', async function () {
            const result = await VendorRepository.findApiKeyRequestByTransactionId("TXN12345");
            expect(result).to.deep.equal([apiData]);
        });

        it('should return an empty array if no request is found', async function () {
            ApiModel.find.resolves([]);
            const result = await VendorRepository.findApiKeyRequestByTransactionId("NON_EXISTENT_TXN");
            expect(result).to.deep.equal([]);
        });
    });

    describe('findAllVendors()', function () {
        it('should return all vendors', async function () {
            const result = await VendorRepository.findAllVendors();
            expect(result).to.deep.equal([vendorData]);
        });

        it('should return an empty array if no vendors exist', async function () {
            UserModel.find.resolves([]);
            const result = await VendorRepository.findAllVendors();
            expect(result).to.deep.equal([]);
        });
    });

    describe('findVendorByEmail()', function () {
        it('should find a vendor by email', async function () {
            UserModel.findOne.resolves(vendorData);

            const result = await VendorRepository.findVendorByEmail("vendor@example.com");
            expect(result).to.deep.equal(vendorData);
        });

        it('should return null if vendor not found', async function () {
            UserModel.findOne.resolves(null);

            const result = await VendorRepository.findVendorByEmail("nonexistent@example.com");
            expect(result).to.be.null;
        });
    });

    describe('findVendorByName()', function () {
        it('should find a vendor by name', async function () {
            UserModel.findOne.resolves(vendorData);

            const result = await VendorRepository.findVendorByName("TestVendor");
            expect(result).to.deep.equal(vendorData);
        });

        it('should return null if vendor not found', async function () {
            UserModel.findOne.resolves(null);

            const result = await VendorRepository.findVendorByName("UnknownVendor");
            expect(result).to.be.null;
        });
    });

    describe('updateVendorApiKey()', function () {
        it('should update vendor API key', async function () {
            const result = await VendorRepository.updateVendorApiKey("TestVendor", "new-api-key");
            expect(result).to.deep.equal(vendorData);
        });

        it('should handle errors when updating vendor API key', async function () {
            VendorModel.findOneAndUpdate.rejects(new Error('Database error'));

            try {
                await VendorRepository.updateVendorApiKey("TestVendor", "new-api-key");
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('findDisputeById()', function () {
        it('should find a dispute by ID', async function () {
            const result = await VendorRepository.findDisputeById("D123");
            expect(result).to.deep.equal(disputeData);
        });

        it('should return null if dispute not found', async function () {
            DisputesModel.findById.resolves(null);

            const result = await VendorRepository.findDisputeById("NON_EXISTENT_DISPUTE");
            expect(result).to.be.null;
        });
    });

    describe('saveDispute()', function () {
        it('should save a dispute', async function () {
            const saveStub = sinon.stub().resolves(disputeData);
            disputeData.save = saveStub;

            const result = await VendorRepository.saveDispute(disputeData);
            expect(result).to.deep.equal(disputeData);
        });

        it('should handle errors when saving a dispute', async function () {
            const saveStub = sinon.stub().rejects(new Error('Database error'));
            disputeData.save = saveStub;

            try {
                await VendorRepository.saveDispute(disputeData);
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('createNotification()', function () {
        it('should create a notification', async function () {
            const result = await VendorRepository.createNotification(notificationData);
            expect(result).to.deep.equal(notificationData);
        });

        it('should handle errors when creating a notification', async function () {
            NotificationModel.create.rejects(new Error('Database error'));

            try {
                await VendorRepository.createNotification(notificationData);
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
});
