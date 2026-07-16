const express = require('express');
const router = express.Router();
const { login, setupMfa, verifyMfa } = require('../controllers/auth.controllar');
const { authanticate } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/mfa/setup', authanticate, setupMfa);
router.post('/mfa/verify', verifyMfa); // Not authenticated, handles both setup and login

module.exports = router;