const jwt = require('jsonwebtoken');
require('dotenv').config();

const validateAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;

        if (req.admin.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only" });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }

};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions" });
        }
        next();
    };
};

module.exports = { validateAdmin, authorize };
