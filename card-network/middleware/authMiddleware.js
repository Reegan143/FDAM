const jwt = require( 'jsonwebtoken');
require('dotenv').config()
const VendorAPIKey = require( '../models/vendorAPIKey.js');


 const validateVendorAccess = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const apiKey = req.headers['x-api-key'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or Invalid JWT token' });
    }

    if (!apiKey) {
      return res.status(401).json({ error: 'Unauthorized: API Key is required' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Unauthorized: Invalid or expired token' });
      }


      const vendor = await VendorAPIKey.findOne({ vendorId: decoded.vendorId, apiKey });

      if (!vendor) {
        return res.status(403).json({ error: 'Unauthorized: Invalid API Key or Vendor Mismatch' });
      }


      req.vendorId = decoded.vendorId; 
      next();
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = validateVendorAccess;
