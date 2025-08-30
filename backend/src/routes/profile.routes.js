const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profile.controller');

// Create/Update own profile (owner only) - support both POST and PUT
router.post('/', auth, profileController.upsertMyProfile);
router.put('/me', auth, profileController.upsertMyProfile);

// Get my profile (auth required) - place BEFORE :userId to avoid param capture
router.get('/me', auth, profileController.getMyProfile);

// Public: get profile by userId
router.get('/:userId', profileController.getProfileByUserId);

module.exports = router;