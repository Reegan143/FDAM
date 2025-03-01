const { generateMultipleTransactions } = require( '../utils/generateTransactions');

const createTransactions = async () => {
  try {
    const transactions = await generateMultipleTransactions({
      senderAccNo: '987654321213',
      receiverAccNo: '987654321454',
      debitCardNumber: '6453728467352452'
    });
    console.log(transactions);
  } catch (error) {
    console.error('Failed to generate transactions', error);
  }
};


createTransactions()