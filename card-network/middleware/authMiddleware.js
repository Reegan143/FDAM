const jwt = require( 'jsonwebtoken');
require('dotenv').config()
const VendorAPIKey = require( '../models/vendorAPIKey.js');


 const validateVendorAccess = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const apiKey = req.headers['x-api-key'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ Missing or Invalid JWT Token");
      return res.status(401).json({ error: 'Unauthorized: Missing or Invalid JWT token' });
    }

    if (!apiKey) {
      console.log("❌ Missing API Key");
      return res.status(401).json({ error: 'Unauthorized: API Key is required' });
    }

    // ✅ Extract JWT Token
    const token = authHeader.split(' ')[1];

    // ✅ Verify JWT
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("❌ JWT Verification Failed:", err.message);
        return res.status(403).json({ error: 'Unauthorized: Invalid or expired token' });
      }

      console.log(`🔍 Verified Vendor JWT: ${decoded.vendorId}`);

      // ✅ Check if the API Key is issued by Card Network (`5001`)
      const vendor = await VendorAPIKey.findOne({ vendorId: decoded.vendorId, apiKey });

      if (!vendor) {
        console.log("❌ Unauthorized Access: API Key does not match vendor");
        return res.status(403).json({ error: 'Unauthorized: Invalid API Key or Vendor Mismatch' });
      }

      console.log(`✅ Authorized Vendor: ${decoded.vendorId}`);

      req.vendorId = decoded.vendorId; // ✅ Store vendor ID in request object
      next();
    });

  } catch (error) {
    console.error('❌ Error in validateVendorAccess middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = validateVendorAccess;
