const express = require('express');
const UserProfileController = require('../controllers/userProfileController');
const { validationUser } = require('../middlewares/protected');

const router = express.Router();

router.use(validationUser);

router.get('/profile', UserProfileController.getUserProfile);
router.put('/profile/update', UserProfileController.updateUserProfile);

module.exports = router;
