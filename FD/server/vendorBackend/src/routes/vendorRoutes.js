const express = require('express');
const VendorController = require('../controllers/vendorController');
const { authenticateVendor } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', authenticateVendor, VendorController.getVendorById);
router.post('/disputes/respond', authenticateVendor, VendorController.respondToDispute);
router.get('/get-api-key', authenticateVendor, VendorController.getApiKey);
router.post('/fetch-transaction', authenticateVendor, VendorController.fetchTransactionData);
router.post('/decode-apikey', authenticateVendor, VendorController.decodeApiKey);
router.post('/request-api-key', authenticateVendor, VendorController.requestApiKey);

module.exports = router;
