const VendorService = require('../services/vendorServices');

class VendorController {

    async  requestApiKey(req, res) {
        try {
            console.log("hello")
            const response = await VendorService.requestApiKey(req.body.transactionId,req.vendor.email);
            res.status(200).json({ message: response.message });
        } catch (error) {
            console.error(error.message)
            res.status(500).json({ error: error.message });
        }
    }

    async getVendorById(req, res) {
        try {
            const vendor = await VendorService.getVendorById(req.vendor.email);
            res.status(200).json(vendor);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async respondToDispute(req, res) {
        try {
            const { disputeId, vendorResponse } = req.body;
            const dispute = await VendorService.respondToDispute(disputeId, vendorResponse);
            res.status(200).json({ message: 'Vendor response recorded and email sent', dispute });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    async getApiKey(req, res) {
        try {
            const apiKey = await VendorService.getApiKey(req.vendor.email);
            res.status(200).json({ apiKey,  });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async decodeApiKey(req, res) {
        try {
            const decodedApiKey = await VendorService.decodeApiKey(req.body.apiKey, req.vendor.email);
            res.status(200).json({ message: 'API Key decoded successfully', decodedApiKey });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async fetchTransactionData(req, res) {
        try {
            const { transactionId } = req.body;
            if (!transactionId) return res.status(400).json({ error: 'Transaction ID is required' });

            const data = await VendorService.fetchTransactionData(req.vendor.vendorName, transactionId, req.headers.authorization);
            res.status(200).json({ message: 'Transaction Data Fetched', data });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new VendorController();
