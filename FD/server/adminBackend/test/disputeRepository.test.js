const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const DisputesRepository = require('../src/repositories/disputesRepository');
const DisputesModel = require('../src/models/disputeModel');

describe('DisputesRepository Unit Tests', function () {
    let disputeData;

    beforeEach(async function () {
        // Mock dispute data
        disputeData = [
            {
                _id: new mongoose.Types.ObjectId(),
                complaintType: "Fraud",
                disputedAmount: 5000,
                status: "Pending",
                createdAt: new Date(2024, 1, 10) // Example date
            },
            {
                _id: new mongoose.Types.ObjectId(),
                complaintType: "Unauthorized Transaction",
                disputedAmount: 3000,
                status: "Under Review",
                createdAt: new Date(2024, 1, 15) // Newer date
            }
        ];

        //  Properly stub `find().sort()` as a chainable query
        const mockQuery = {
            sort: sinon.stub().resolves(disputeData) // `sort()` should return sorted disputes
        };
        sinon.stub(DisputesModel, 'find').returns(mockQuery); // `find()` should return a query-like object
    });

    afterEach(function () {
        sinon.restore(); // Restore all stubs after each test
    });

    it('should get all disputes sorted by createdAt in descending order', async function () {
        const result = await DisputesRepository.getAllDisputes();
        expect(result).to.be.an('array');
        expect(result.length).to.be.equal(2);
        expect(result[0].complaintType).to.equal("Fraud"); // Newest should be first
    });

    it('should handle errors when fetching disputes', async function () {
        const mockQuery = { sort: sinon.stub().rejects(new Error('Database error')) };
        DisputesModel.find.returns(mockQuery); // Make `find().sort()` fail

        try {
            await DisputesRepository.getAllDisputes();
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });
});
