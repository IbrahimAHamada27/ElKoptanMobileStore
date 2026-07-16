const express = require('express');
const router = express.Router();
const { getUsers, createAdmin, updateAdmin, deleteAdmin } = require('../controllers/user.controller');
const { authanticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middlewares');

// Middleware to verify the super admin action code
const verifySuperAdminCode = (req, res, next) => {
    const code = req.headers['x-super-admin-code'] || req.body.code || req.query.code;
    if (code !== process.env.SUPER_ADMIN_CODE) {
        return res.status(403).json({ error: "كود التحقق الخاص بالسوبر أدمن غير صحيح أو غير متوفر" });
    }
    next();
};

// All route operations require authentication and the role of 'superadmin'
router.use(authanticate);
router.use(authorize('superadmin'));

// Fetch all regular admins
router.get('/', getUsers);

// Create new admin (requires superadmin authorization and the secure verification code)
router.post('/createadmin', verifySuperAdminCode, createAdmin);

// Update admin details (requires superadmin authorization and the secure verification code)
router.put('/:id', verifySuperAdminCode, updateAdmin);

// Delete admin (requires superadmin authorization and the secure verification code)
router.delete('/:id', verifySuperAdminCode, deleteAdmin);

module.exports = router;
