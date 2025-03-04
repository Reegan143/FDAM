const nodemailer = require('nodemailer');
const UserRepository = require('../repositories/userRepository')
const NotificationRepository = require('../repositories/notificationRepository')
const TransactionRepository = require('../repositories/transactionRepository')
const AdminRepository = require('../repositories/adminRepository');
const {sendMail} = require('../utils/sendMail')
const axios = require('axios');



class AdminService {

    async approveApiKeyRequest(requestId, email, transactionId) {
        const request = await AdminRepository.findApiKeyRequest(requestId);
        if (!request || request.status !== 'pending') {
            throw new Error("No pending API key request found for this vendor");
        }
        const vendor = await UserRepository.findUserByEmail(email);
        if (!vendor) throw new Error("Vendor not found");
        const vendorName = vendor.vendorName
        
        const response = await axios.post('http://localhost:5001/api/vendor/generate-api-key', { vendorName, transactionId });
        if (!response.data.apiKey) throw new Error(response.data.error);
        
        vendor.apiKey.push({apiKey : response.data.apiKey, transactionId});
        await vendor.save();
        await AdminRepository.updateApiKeyRequest(requestId, 'approved');
        setTimeout(async () =>{
            await AdminRepository.findAndDeleteApiKeyRequest(requestId)
        }, 60000 * 5)
        
        NotificationRepository.createNotification({
            email: email,
            userName: vendorName,
            messages: `Your API Access key request has been approved for the Transaction Id : ${transactionId}`,
        })

        let index  = await vendor.apiKey.indexOf({apiKey : response.data.apiKey, transactionId})
        const altered = await vendor.apiKey.splice(index, 1);
        
        await this.deleteApiKeyOneDay(email, altered[0]);

        return { message: "API key approved and generated", apiKey: vendor.apiKey};
    }

    async deleteApiKeyOneDay(email, altered){
        setTimeout(async () => {
            const vendor = await UserRepository.findUserByEmail(email);
            vendor.apiKey = vendor.apiKey.filter(Key => Key.transactionId!== altered.transactionId);
            await vendor.save();
        }, 60000 * 60 * 24); // 24 hour
    }

    async rejectApiKeyRequest(requestId, email, transactionId) {
        
        const request = await AdminRepository.findApiKeyRequest(requestId);
        if (!request || request.status !== 'pending') {
            throw new Error("No pending API key request found for this vendor");
        }

        await AdminRepository.updateApiKeyRequest(requestId, 'rejected');
        NotificationRepository.createNotification({
            email: email,
            messages: `Your API Access Key request has been rejected for the transaction Id : ${transactionId}`,
        })
        setTimeout(async () =>{
            await AdminRepository.findAndDeleteApiKeyRequest(requestId)
        }, 60000 * 5)

        return { message: "API key request rejected" };
    }

    async getApiKeyRequests() {
        return await AdminRepository.getAllApiKeyRequests();
    }

    async getAdminByEmail(email) {
        const admin = await AdminRepository.findAdminByEmail(email);
        if (!admin) throw new Error("Admin not found");
        return admin;
    }

    async getAllDisputes(){
        return await AdminRepository.getAllDisputes();
    }

    

    async updateDisputeStatus(disputeId, status, remarks, adminId) {
        const updatedDispute = await AdminRepository.updateDisputeStatus(disputeId, status, remarks, adminId);
        if(updatedDispute.status !== "submitted"){
            const user = await UserRepository.findUserByEmail(updatedDispute.email)
            if(!user) throw new Error("User not found")
            await sendMail(updatedDispute.email, 
                updatedDispute.ticketNumber,
                user.userName,
                updatedDispute.amount,
                `Your Dispute/Complaint has been ${status}. 
                Admin Response : ${remarks}`,
                status ,
                updatedDispute.vendorName ? updatedDispute.vendorName :  `Transaction Id : ${updatedDispute.transactionId}`)
            await NotificationRepository.createNotification({
                email: updatedDispute.email,
                ticketNumber: updatedDispute.ticketNumber,
                userName: user.userName,
                messages: `Your Dispute/Complaint has been ${status}. 
                Admin Response : ${remarks}`,
                complaintType: updatedDispute.complaintType
            })
            return updatedDispute
        }

    }

    async getTransactionById(transactionId){
        return await TransactionRepository.findTransactionById(transactionId);
    }

    async generateFraudReport(startDate, endDate, adminEmail) {
        const report = await AdminRepository.generateFraudReport(startDate, endDate);

        // Send report via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            to: adminEmail,
            subject: 'Fraud Report',
            attachments: [{
                filename: 'fraud_report.json',
                content: JSON.stringify(report, null, 2)
            }]
        });

        return report;
    }

}

module.exports = new AdminService();
