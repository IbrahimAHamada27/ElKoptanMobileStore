const express = require('express');
const { getSetting, updateSetting, getAllSettings } = require('../controllers/setting.controller.js');
const { authanticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middlewares');

const router = express.Router();

router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.put('/:key', authanticate, authorize('admin'), updateSetting);

module.exports = router;
