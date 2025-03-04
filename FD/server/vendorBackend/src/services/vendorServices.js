const VendorRepository = require('../repositories/vendorRepository');
const { sendMail } = require('../utils/sendMail');
const UserRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');
const vendorRepository = require('../repositories/vendorRepository');

class VendorService {
    async getVendorById(email) {
        const vendor = await VendorRepository.findVendorByEmail(email);
        if (!vendor) throw new Error("Vendor not found");
        return vendor;
    }

    async respondToDispute(disputeId, vendorResponse) {
        const dispute = await VendorRepository.findDisputeById(disputeId);
        if (!dispute) throw new Error("Dispute not found");
        const user = await UserRepository.findUserByEmail(dispute.email);
        if (!user) throw new Error("User not found");

        if (dispute.vendorResponse) throw new Error("Response already submitted for this dispute");

        dispute.vendorResponse = vendorResponse;
        dispute.status = 'closed';
        dispute.resolvedAt = new Date();
        await VendorRepository.saveDispute(dispute);


        await sendMail(dispute.email, dispute.ticketNumber, user.userName, dispute.amount, `Your dispute has been resolved. Vendor response: ${vendorResponse}`, 'closed', dispute.vendorName);

        await VendorRepository.createNotification({
            email: dispute.email,
            ticketNumber: dispute.ticketNumber,
            userName: user.userName,
            messages: `Your dispute has been resolved. Vendor response: ${vendorResponse}`,
            complaintType: 'resolved'
        });

        return dispute;
    }


    async getApiKey(email) {

        const vendor = await VendorRepository.findVendorByEmail(email);
        if (!vendor || !vendor.apiKey) throw new Error("API Key not found");
        return vendor.apiKey;
    }

    async fetchTransactionData(vendorName, transactionId, authorization) {
        const vendor = await VendorRepository.findVendorByName(vendorName);
        if (!vendor || !vendor.apiKey) throw new Error("API Key not found. Please request an API Key first.");

        const response = await axios.get(`http://localhost:5001/api/card-network/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${authorization.split(' ')[1]}`,
                'x-api-key': vendor.apiKey
            }
        });

        return response.data;
    }

    async decodeApiKey(apiKey, email){
        const vendor = await vendorRepository.findVendorByEmail(email)
        if(!vendor ||!vendor.apiKey) throw new Error("API Key not found. Please request an API Key first.");
        
        try{
            var decodedApi = await jwt.verify(apiKey, vendor.vendorName);
        }
        catch(e){
            throw new Error("API Key is not valid. Please request it again")
        }
            
        return decodedApi;
    }


    async requestApiKey(transactionId, email) {
        const vendor = await UserRepository.findUserByEmail(email);
        if (!vendor) throw new Error("Vendor not found");
        
        const vendorName = vendor.vendorName
        
        const transaction = vendor.transactions.find(transaction => transaction.transactionId == transactionId)
        if (!transaction) throw new Error("Transaction not found for this vendor");
        
        const existingRequest = await VendorRepository.findApiKeyRequestByTransactionId(transactionId);
        const pendingexistingRequest = existingRequest.find(request => request.status === 'pending')
        if (existingRequest && pendingexistingRequest) {
           throw new Error("API key request is already pending");
        }

        await VendorRepository.createApiKeyRequest({ vendorName, email, transactionId, status: 'pending' });
        return { message: "API key request submitted. Awaiting admin approval." };
    }
}

module.exports = new VendorService();
