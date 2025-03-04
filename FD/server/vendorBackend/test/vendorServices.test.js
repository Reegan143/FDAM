const { expect } = require('chai');
const sinon = require('sinon');
const VendorService = require('../src/services/vendorServices');
const VendorRepository = require('../src/repositories/vendorRepository');
const UserRepository = require('../src/repositories/userRepository');
const { sendMail } = require('../src/utils/sendMail');
const jwt = require('jsonwebtoken');
const axios = require('axios');

describe('VendorService', () => {
    let vendorStub, userStub, mailStub, axiosStub, jwtStub;

    afterEach(() => {
        sinon.restore();
    });

    describe('getVendorById', () => {
        it('should return vendor details when email exists', async () => {
            const mockVendor = { email: 'vendor@example.com', name: 'Vendor Inc' };
            vendorStub = sinon.stub(VendorRepository, 'findVendorByEmail').resolves(mockVendor);

            const result = await VendorService.getVendorById('vendor@example.com');

            expect(result).to.deep.equal(mockVendor);
            expect(vendorStub.calledOnceWith('vendor@example.com')).to.be.true;
        });

        it('should throw an error if vendor not found', async () => {
            vendorStub = sinon.stub(VendorRepository, 'findVendorByEmail').resolves(null);

            try {
                await VendorService.getVendorById('unknown@example.com');
            } catch (error) {
                expect(error.message).to.equal('Vendor not found');
            }
        });
    });

    describe('respondToDispute', () => {
        it('should successfully respond to a dispute', async () => {
            const mockDispute = { disputeId: '123', email: 'user@example.com', ticketNumber: 'T123', vendorResponse: null };
            const mockUser = { email: 'user@example.com', userName: 'JohnDoe' };

            sinon.stub(VendorRepository, 'findDisputeById').resolves(mockDispute);
            sinon.stub(UserRepository, 'findUserByEmail').resolves(mockUser);
            sinon.stub(VendorRepository, 'saveDispute').resolves();
            mailStub = sinon.stub(sendMail).resolves();
            sinon.stub(VendorRepository, 'createNotification').resolves();

            const result = await VendorService.respondToDispute('123', 'Resolved issue');

            expect(result.vendorResponse).to.equal('Resolved issue');
            expect(result.status).to.equal('closed');
            expect(mailStub.calledOnce).to.be.true;
        });

        it('should throw an error if dispute is not found', async () => {
            sinon.stub(VendorRepository, 'findDisputeById').resolves(null);

            try {
                await VendorService.respondToDispute('123', 'Resolved issue');
            } catch (error) {
                expect(error.message).to.equal('Dispute not found');
            }
        });
    });

    describe('getApiKey', () => {
        it('should return API key if vendor exists', async () => {
            const mockVendor = { email: 'vendor@example.com', apiKey: 'test-api-key' };
            vendorStub = sinon.stub(VendorRepository, 'findVendorByEmail').resolves(mockVendor);

            const result = await VendorService.getApiKey('vendor@example.com');

            expect(result).to.equal('test-api-key');
        });

        it('should throw an error if vendor API key is not found', async () => {
            vendorStub = sinon.stub(VendorRepository, 'findVendorByEmail').resolves(null);

            try {
                await VendorService.getApiKey('vendor@example.com');
            } catch (error) {
                expect(error.message).to.equal('API Key not found');
            }
        });
    });

    describe('fetchTransactionData', () => {
        it('should fetch transaction data from card network API', async () => {
            const mockVendor = { vendorName: 'TestVendor', apiKey: 'valid-api-key' };
            vendorStub = sinon.stub(VendorRepository, 'findVendorByName').resolves(mockVendor);
            axiosStub = sinon.stub(axios, 'get').resolves({ data: { transactionId: '123', amount: 500 } });

            const result = await VendorService.fetchTransactionData('TestVendor', '123', 'Bearer mockToken');

            expect(result).to.deep.equal({ transactionId: '123', amount: 500 });
        });

        it('should throw an error if API key is not found', async () => {
            vendorStub = sinon.stub(VendorRepository, 'findVendorByName').resolves(null);

            try {
                await VendorService.fetchTransactionData('TestVendor', '123', 'Bearer mockToken');
            } catch (error) {
                expect(error.message).to.equal('API Key not found. Please request an API Key first.');
            }
        });
    });

    describe('decodeApiKey', () => {
        it('should decode API key successfully', async () => {
            const mockVendor = { email: 'vendor@example.com', vendorName: 'TestVendor', apiKey: 'valid-api-key' };
            sinon.stub(VendorRepository, 'findVendorByEmail').resolves(mockVendor);
            jwtStub = sinon.stub(jwt, 'verify').returns({ decoded: true });

            const result = await VendorService.decodeApiKey('valid-api-key', 'vendor@example.com');

            expect(result).to.deep.equal({ decoded: true });
        });

        it('should throw an error if API key is invalid', async () => {
            sinon.stub(VendorRepository, 'findVendorByEmail').resolves({ vendorName: 'TestVendor' });
            jwtStub = sinon.stub(jwt, 'verify').throws(new Error());

            try {
                await VendorService.decodeApiKey('invalid-api-key', 'vendor@example.com');
            } catch (error) {
                expect(error.message).to.equal('API Key not found. Please request an API Key first.');
            }
        });
    });

    describe('requestApiKey', () => {
        it('should request an API key successfully', async () => {
            const mockUser = {
                email: 'vendor@example.com',
                vendorName: 'TestVendor',
                transactions: [{ transactionId: '123' }]
            };
            sinon.stub(UserRepository, 'findUserByEmail').resolves(mockUser);
            sinon.stub(VendorRepository, 'findApiKeyRequestByTransactionId').resolves([]);
            sinon.stub(VendorRepository, 'createApiKeyRequest').resolves();

            const result = await VendorService.requestApiKey('123', 'vendor@example.com');

            expect(result).to.deep.equal({ message: "API key request submitted. Awaiting admin approval." });
        });

        it('should throw an error if transaction is not found for vendor', async () => {
            const mockUser = {
                email: 'vendor@example.com',
                vendorName: 'TestVendor',
                transactions: []
            };
            sinon.stub(UserRepository, 'findUserByEmail').resolves(mockUser);

            try {
                await VendorService.requestApiKey('999', 'vendor@example.com');
            } catch (error) {
                expect(error.message).to.equal('Transaction not found for this vendor');
            }
        });

        it('should throw an error if API key request is already pending', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves({ vendorName: 'TestVendor', transactions: [{ transactionId: '123' }] });
            sinon.stub(VendorRepository, 'findApiKeyRequestByTransactionId').resolves([{ status: 'pending' }]);

            try {
                await VendorService.requestApiKey('123', 'vendor@example.com');
            } catch (error) {
                expect(error.message).to.equal('API key request is already pending');
            }
        });
    });
});
