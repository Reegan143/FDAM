const AdminService = require('../services/adminServices');


class AdminController {


    async getAllDisputes(req, res){
        try{
            const disputes = await AdminService.getAllDisputes();

            res.status(200).json(disputes || []);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    async approveApiKeyRequest(req, res) {
        try {
            const response = await AdminService.approveApiKeyRequest(req.body.requestId,req.body.email, req.body.transactionId);
            res.status(200).json({ message: 'API Key approved successfully', apiKey : response.apiKey });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }   
    async rejectApiKeyRequest(req, res) {
        try {
            const response = await AdminService.rejectApiKeyRequest(req.body.requestId, req.body.email, req.body.transactionId);
            res.status(200).json({ message: 'API Key rejected', apiKey : response.message });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }   

    async getApiKeyRequests(req, res) {
        try {
            const apiKeyRequests = await AdminService.getApiKeyRequests();
            res.status(200).json(apiKeyRequests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    async getAdminByEmail(req, res) {
        try {
            const admin = await AdminService.getAdminByEmail(req.admin.email);
            res.status(200).json(admin);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }


    async updateDisputeStatus(req, res) {
        try {
            const { disputeId, status, remarks } = req.body;
            const updatedDispute = await AdminService.updateDisputeStatus(disputeId, status, remarks, req.admin.adminId);
            res.status(200).json(updatedDispute);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    async getTransactionById(req, res){
        try{
            const transaction = await AdminService.getTransactionById(req.params.transactionId);
            res.status(200).json(transaction);
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    async generateFraudReport(req, res) {
        try {
            const { startDate, endDate } = req.body;
            const report = await AdminService.generateFraudReport(startDate, endDate, req.admin.email);
            res.status(200).json(report);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AdminController();
