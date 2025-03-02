const TransactionModel = require('../models/Transaction');

const storeTransaction = async (req, res) => {
  const { senderAccNo, receiverAccNo, amount, debitCardNumber, transactionId, status, senderName, receiverName } = req.body

        const transactionDataObject = { transactionId, senderAccNo, receiverAccNo, amount, 
                                        debitCardNumber, status, senderName, receiverName };

        const transaction = await TransactionModel.create(transactionDataObject);
        return res.status(201).json(transaction);
}

const getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const vendorId = req.vendorId; 

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findOne({ transactionId, vendorId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {storeTransaction, getTransactionDetails}
