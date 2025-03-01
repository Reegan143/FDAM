const express = require('express');
const DisputesController = require('../controllers/disputeController');
const { validationUser } = require('../middlewares/protected');

const Router = express.Router();

Router.route('/disputeform')
    // .get(DisputesController.getAllDisputes)
    .post(validationUser, DisputesController.registerDispute);

Router.route('/me')
    .get(validationUser, DisputesController.getUserDisputes);

Router.route('/dispute-status')
    .post(validationUser, DisputesController.getDisputeById);

Router.get('/vendor/:vendorName', validationUser, DisputesController.getDisputeByVendorName);

module.exports = Router;
