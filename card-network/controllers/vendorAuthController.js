const VendorAPIKey = require( '../models/vendorAPIKey.js');
const TransactionModel = require('../models/Transaction.js')

const jwt = require('jsonwebtoken')


const generateVendorApiKey = async (req, res) => {
  try {
    const { vendorName, transactionId } = req.body;

    if (!vendorName) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }


    let vendor = await VendorAPIKey.findOne({ vendorName });

    const isTransaction = await TransactionModel.findOne({ transactionId})
    if (!isTransaction) {
      return res.json({ error: 'Transaction not found' });
    }

    let transaction = {senderAccNo : isTransaction.senderAccNo,
                        senderName : isTransaction.senderName,
                        transactionId : isTransaction.transactionId,
                        receiverAccNo : isTransaction.receiverAccNo,
                        receiverName : isTransaction.receiverName,
                        amount : isTransaction.amount,
                        status : isTransaction.status,
                        transactionDate : isTransaction.transactionDate
    }

    const apiKey = await jwt.sign({transaction}, vendorName, {expiresIn:'24h'})

    if (!vendor) {
      vendor = new VendorAPIKey({ vendorName, apiKey });
      await vendor.save();
    } else {
      vendor.apiKey = apiKey
      await vendor.save();
    }


    return res.status(200).json({
      message: 'API Key issued successfully',
      vendorName,
      transactionId,
      apiKey: vendor.apiKey
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getVendorApiKey = async (req, res) => {
  try {
    const { vendorName } = req.params;

    if (!vendorName) {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }


    const vendor = await VendorAPIKey.findOne({ vendorName });

    if (!vendor) {
      return res.status(404).json({ error: 'API Key not found for vendor' });
    }


    return res.status(200).json({ vendorName, apiKey: vendor.apiKey });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API Key is required' });
    }


    const vendor = await VendorAPIKey.findOne({ apiKey });

    if (!vendor) {
      return res.status(403).json({ error: 'Invalid API Key' });
    }


    req.vendorName = vendor.vendorName; 
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {generateVendorApiKey, getVendorApiKey,verifyApiKey}
