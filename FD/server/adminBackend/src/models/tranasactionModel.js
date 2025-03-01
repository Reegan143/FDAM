const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    senderAccNo: { type: Number, required: true },
    senderName : { type: String, required: true},
    transactionId: { type: Number, required: true},
    receiverAccNo: { type: Number, required: true },
    receiverName: { type: String, required: true},
    amount: { type: Number, required: true },
    debitCardNumber: { type: Number, required: true },
    transactionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
