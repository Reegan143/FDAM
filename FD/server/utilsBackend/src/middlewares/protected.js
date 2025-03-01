const jwt = require('jsonwebtoken');
require('dotenv').config()


async function validationUser(req, res, next) {
  try {
    const header = req.header('Authorization');
    
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded;
    
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

deleteCachedToken = (req, res) => {
  req.user = null;
  res.json({ message: 'Token deleted' });
}

module.exports = {validationUser};