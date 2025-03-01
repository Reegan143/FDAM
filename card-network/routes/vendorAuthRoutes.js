const express = require('express');
const { generateVendorApiKey, getVendorApiKey, verifyApiKey } = require( '../controllers/vendorAuthController.js');

const router = express.Router();

router.post('/generate-api-key', generateVendorApiKey);

router.get('/get-api-key/:vendorId', getVendorApiKey);

router.get('/verify-api-key', verifyApiKey);

module.exports = router;
