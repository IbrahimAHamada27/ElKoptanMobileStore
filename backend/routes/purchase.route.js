const express = require('express');
const router = express.Router();

const {
  addPurchase,
  getAllPurchases,
  userPurchases
} = require('../controllers/purchase.controllar');

const { authanticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middlewares');

router.post('/', authanticate, authorize('user'), addPurchase);
router.get('/', authanticate, authorize('admin'), getAllPurchases);
router.get('/mypurchases', authanticate, authorize('user'), userPurchases);
module.exports = router;