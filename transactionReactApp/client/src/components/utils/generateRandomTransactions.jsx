import generateTenDigitTransactionId from '../utils/createTransactionId';

export async function generateRandomTransactions(senderAccNo, receiverAccNo, debitCardNumber, senderName, receiverName) {
  const transactions = [];
  const minAmount = 100;
  const maxAmount = 10000;
  
  // Function to generate random amount
  const getRandomAmount = () => {
    return Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
  };

  // Create 10 transactions
  for (let i = 0; i < 10; i++) {
    const transactionId = await generateTenDigitTransactionId();
    const amount = getRandomAmount();
    
    // Alternate between 'paid' and 'failed' status
    const status = i % 2 === 0 ? 'paid' : 'failed';

    transactions.push({
      transactionId,
      senderAccNo,
      receiverAccNo,
      senderName,
      receiverName,
      amount,
      debitCardNumber, // Using the provided debit card number
      status,
      transactionDate: new Date().toISOString()
    });
  }

  return transactions;
}
