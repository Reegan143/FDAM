const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    vendorId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    apiKey: { type: String },
    notifications: [{ message: String, timestamp: Date }]
});

module.exports = mongoose.model('Vendor', VendorSchema);
