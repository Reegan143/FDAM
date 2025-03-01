const mongoose = require('mongoose')

const apiSchema = new mongoose.Schema({
    vendorName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    transactionId : {
        type : String,
        required : true
    },
    status : {
        type : String,
        default : 'pending',
        enum : ['pending', 'approved', 'rejected']
    }
})

const ApiModel = mongoose.model('Api', apiSchema)
module.exports = ApiModel