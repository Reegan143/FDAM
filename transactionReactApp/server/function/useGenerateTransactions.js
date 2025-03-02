const { generateMultipleTransactions } = require( '../utils/generateTransactions');

const createTransactions = async () => {
  try {
    const transactions = await generateMultipleTransactions({
      senderAccNo: '756456354635',
      receiverAccNo: '987654321454',
      debitCardNumber: '9823547612083460'
    });
    console.log(transactions);
  } catch (error) {
    console.error('Failed to generate transactions', error);
  }
};


createTransactions()