const express = require('express');
const { storeTransaction, getTransactionDetails } = require( '../controllers/cardNetworkController.js');
const validateVendorAccess  = require( '../middleware/authMiddleware.js');

const router = express.Router();

router.post('/store', storeTransaction);

router.get('/transactions', validateVendorAccess, getTransactionDetails);

module.exports = router;
