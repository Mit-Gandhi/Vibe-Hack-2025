const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/signup/request', ctrl.requestSignup);
router.post('/signup/verify', ctrl.verifySignup);
router.post('/login', ctrl.login);
router.get('/profile', auth, ctrl.profile);

module.exports = router;