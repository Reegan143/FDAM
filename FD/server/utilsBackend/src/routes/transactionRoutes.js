const express = require('express');
const TransactionController = require('../controllers/transactionController');
const { validationUser } = require('../middlewares/protected');

const router = express.Router();

router.post('/make', TransactionController.makeTransaction);
router.post('/check-failed', TransactionController.checkAndHandleFailedTransaction);
router.get('/', validationUser, TransactionController.getUserTransactions);
router.delete('/', validationUser, TransactionController.deleteTransactions);

module.exports = router;
