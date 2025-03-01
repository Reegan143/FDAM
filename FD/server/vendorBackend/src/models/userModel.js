const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: Number,
        min: 1000000000,
        max: 9999999999,
        required : true
    },
    senderName : {
        type : String,
        required : true
    },
    transactionDate: { type: Date, required: true },
    transactionAmount: { type: Number, required: true },
    digitalChannel: { type: String, required: true },
    senderAccNo: { type: Number, required: true },
    receiverAccNo: { type: Number, required: true },
    receiverName : { type: String, required: true},
    status: { type: String, required: true, enum: ['paid', 'pending', 'failed'] },
    debitCardNumber: { type: Number, required: true }
});

const UserSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    accNo: { type: Number, required: true, unique: true, min: 100000000000, max: 999999999999 },
    adminId: { type: Number, min: 1000, max: 9999 },
    cuid: { type: Number, required: true, unique: true, min: 10000000, max: 99999999 },
    email: { type: String, required: true, unique: true },
    branchCode: { type: String, required: true },
    branchName: { type: String, required: true },
    password: { type: String, required: true },
    debitCardNumber: { type: Number, required: true, unique: true },
    cardType: { type: String, required: true, enum: ['visa', 'master card'] },
    role: { type: String, default: 'user', enum: ['user', 'admin', 'vendor'] },
    vendorName: { type: String, default: null },
    apiKey : {
        type: [Object],
        default: []
    },
    transactions: { type: [TransactionSchema], default: [] }
}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
