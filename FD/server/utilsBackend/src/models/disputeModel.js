const mongoose = require('mongoose');


const DisputeScheme = new mongoose.Schema({
    
    digitalChannel: { 
      type: String, required: true
      },
    complaintType: {
       type: String, required: true 
      },
    transactionId: {
       type: Number, required: true, 
       min : 1000000000,   
       max : 9999999999
      },
    description: { 
      type: String, required: true 
  },
    debitCardNumber: {
       type: Number, required: true, length: 16
       },
    email : {
       type: String, 
       required: true, 
    },
    status : {
       type: String, 
       default: 'submitted', 
       enum: ["submitted",'approved', 'closed', 'rejected'] 
      },
    ticketNumber : {
       type: Number, 
       unique: true
  
    },
    cardType : {
       type: String, 
       required: true,
       enum : ['visa', 'master card']
    },
    adminId : {
       type: Number, 
       required: true
    },
    adminRemarks : {
       type: String, 
       default: null
    },
    resolvedBy :{
       type: Number, 
       default: null
    },
    resolvedAt :{
       type: Date, 
       default: null
    },
    createdAt : {
       type: Date, 
       default: Date.now
    },
    amount : {
         type: Number, 
         required: true
    },
    vendorName : {
       type: String,
       default: null
    },
    vendorResponse : {
      type : String,
      default : null
    }
   },
   {timestamps : true}
);
  
  const DisputesModel = mongoose.model('disputes', DisputeScheme);
  module.exports = DisputesModel;