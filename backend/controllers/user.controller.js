const User = require('../models/user.model');
const crypto = require('crypto');

// Create admin account (for Super Admin usage)
exports.createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "جميع الخانات مطلوبة" });
    }

    try {
        // Hash incoming email (username) to check if already exists
        const hashedEmail = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
        const existing = await User.findOne({ email: hashedEmail });
        if (existing) {
            return res.status(400).json({ error: "اسم المستخدم هذا مسجل بالفعل" });
        }

        // Pre-save schema hooks will automatically hash email, name, and password
        await User.create({
            name,
            email,
            password,
            role: 'admin'
        });
        res.status(201).json({ success: true, message: "تم إضافة المدير بنجاح" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// List all regular admins (Super Admin is filtered out)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'admin' });
        res.status(200).json({ success: true, message: 'قائمة المدراء', data: users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update regular admin details (for Super Admin usage)
exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ _id: id, role: 'admin' });
        if (!user) {
            return res.status(404).json({ error: "المدير غير موجود" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ success: true, message: "تم تحديث بيانات المدير بنجاح" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete regular admin (for Super Admin usage)
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOneAndDelete({ _id: id, role: 'admin' });
        if (!user) {
            return res.status(404).json({ error: "المدير غير موجود" });
        }
        res.status(200).json({ success: true, message: "تم حذف المدير بنجاح" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};