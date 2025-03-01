const express = require('express');
const { storeTransaction, getTransactionDetails } = require( '../controllers/cardNetworkController.js');
const validateVendorAccess  = require( '../middleware/authMiddleware.js');

const router = express.Router();

// ✅ Backend calls this to store transaction details
router.post('/store', storeTransaction);

// ✅ Vendor calls this to fetch transaction details
router.get('/transactions', validateVendorAccess, getTransactionDetails);

module.exports = router;
