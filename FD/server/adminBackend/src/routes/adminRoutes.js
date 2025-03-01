const express = require('express');
const AdminController = require('../controllers/adminController');
const { validateAdmin } = require('../middlewares/adminAuth');
const { authorize} = require('../middlewares/adminAuth')

const Router = express.Router();




Router.use(validateAdmin);
Router.get('/transaction/:transactionId',authorize('admin'), AdminController.getTransactionById );
 Router.get('/api-key-requests',authorize('admin'), AdminController.getApiKeyRequests );
Router.patch('/approve-api-key',authorize('admin'), AdminController.approveApiKeyRequest )
Router.patch('/reject-api-key',authorize('admin'), AdminController.rejectApiKeyRequest )
Router.get('/disputes',authorize('admin'), AdminController.getAllDisputes )
Router.get('/me', AdminController.getAdminByEmail);
// Router.get('/high-value-disputes', AdminController.getHighValueDisputes);
Router.patch('/dispute-status',authorize('admin'), AdminController.updateDisputeStatus);
Router.post('/generate-report', AdminController.generateFraudReport);

module.exports = Router;
