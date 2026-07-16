const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const express = require('express');
const app = express();

const cors = require('./middlewares/cors.middleware');
app.use(cors);

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        const ip = req.ip || req.connection?.remoteAddress;
        return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    }
});

app.use(limiter);

const port = process.env.PORT || 3000;

const { connectDB } = require('./config/db.config');
const User = require('./models/user.model');

// Connect to MongoDB and initialize Super Admin
connectDB().then(() => {
    initSuperAdmin();
});

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/user', require('./routes/user.route'));
app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/product', require('./routes/product.route'));
app.use('/api/v1/purchase', require('./routes/purchase.route'));
app.use('/api/v1/setting', require('./routes/setting.route'));

// Automatically seed/ensure Super Admin exists in database
async function initSuperAdmin() {
    try {
        const superAdminUser = process.env.SUPER_ADMIN_USER;
        const superAdminPass = process.env.SUPER_ADMIN_PASSWORD;
        if (!superAdminUser || !superAdminPass) {
            console.log('Warning: Super Admin credentials are not set in .env. Skipping.');
            return;
        }

        // Check if existing (we hash to compare since emails are SHA-256 hashed in database)
        const crypto = require('crypto');
        const hashedEmail = crypto.createHash('sha256').update(superAdminUser.trim().toLowerCase()).digest('hex');
        
        const existing = await User.findOne({ email: hashedEmail });
        if (!existing) {
            // Mongoose pre-save hook will automatically hash name, email, and password.
            await User.create({
                name: 'Super Admin',
                email: superAdminUser,
                password: superAdminPass,
                role: 'superadmin'
            });
            console.log('Super Admin account created and hashed in database successfully.');
        } else {
            console.log('Super Admin account verified.');
        }
    } catch (err) {
        console.error('Failed to initialize Super Admin account:', err.message);
    }
}

// Global Error Handler for Multer and other uncaught errors
const multer = require('multer');
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});

module.exports = app;