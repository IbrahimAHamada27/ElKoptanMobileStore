const express = require('express');
const router = express.Router();
const { getDemoMenu } = require('../controllers/menu.controller');

router.get('/', getDemoMenu);

module.exports = router;
