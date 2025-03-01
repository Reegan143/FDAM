const mongoose = require('mongoose')

const vendorApiKeySchema = new mongoose.Schema({
  vendorName: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('VendorAPIKey', vendorApiKeySchema);
