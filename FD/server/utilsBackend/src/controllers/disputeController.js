const DisputesService = require('../services/disputeServices');

class DisputesController {
    async registerDispute(req, res) {
        try {
            const dispute = await DisputesService.registerDispute(req.user, req.body);
            res.status(201).json({ message: 'Complaint registered successfully!', dispute });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    async getUserDisputes(req, res) {
        try {
            const disputes = await DisputesService.getUserDisputes(req.user.email);
            res.status(200).json(disputes);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch disputes' });
        }
    }

    async getDisputeById(req, res) {
        try {
            const dispute = await DisputesService.getDisputeByTicketNumber(req.body.ticketNumber);
            res.status(200).json(dispute);
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ error : error.message });
        }
    }

    async getDisputeByVendorName(req, res) {
        try {
            const disputes = await DisputesService.getDisputeByVendorName(req.params.vendorName);
            res.json(disputes);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new DisputesController();
