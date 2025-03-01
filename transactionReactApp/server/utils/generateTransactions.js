const axios  = require('axios');

// /**
//  * Generate 10 random transactions between two accounts
//  * @param {Object} params - Transaction generation parameters
//  * @param {string} params.senderAccNo - Sender's account number
//  * @param {string} params.receiverAccNo - Receiver's account number
//  * @param {string} params.debitCardNumber - Debit card number
//  * @returns {Promise<Array>} Array of generated transactions
//  */
exports.generateMultipleTransactions = async ({ 
  senderAccNo, 
  receiverAccNo, 
  debitCardNumber 
}) => {
  try {
    if (!senderAccNo || !receiverAccNo || !debitCardNumber) {
      throw new Error('All parameters are required');
    }
    console.log(senderAccNo, receiverAccNo)

    const transactions = [];
    for (let i = 0; i < 10; i++) {
      const transactionId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const amount = Math.floor(Math.random() * 100000) + 1; // Random amount between 1 and 1000
      const status = 'paid';

      const transactionDetails = await axios.post('http://18.210.30.25:8003/api/transactions/make', {
        senderAccNo,
        transactionId,
        receiverAccNo,
        debitCardNumber,
        amount,
        status
      });
      const { senderName, receiverName } = transactionDetails.data;
      
      // Create transaction object
      const transaction = {
        senderAccNo,
        receiverAccNo,
        debitCardNumber,
        senderName,
        receiverName,
        transactionId,
        amount,
        status,
      };
  
      
      // Store each transaction
      await axios.post('http://18.210.30.25:5001/api/transactions/store', transaction);
      
      transactions.push(transaction);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Generated ${transactions.length} transactions`);
    return transactions;

  } catch (error) {
    console.error('Error generating transactions:', error);
    throw error;
  }
};
