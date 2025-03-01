const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateVendor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No valid token provided.' });
    }
    
    const token = authHeader.split(' ')[1];

    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
      
    req.vendor = decoded; 
    next();
  

  } catch (error) {
    return res.status(401).json({ message : 'Internal server error' });
  }
};


module.exports = { authenticateVendor};
