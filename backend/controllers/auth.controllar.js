const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const signToken = (user, isTemp = false) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name, isTemp },
        process.env.SECRET_KEY,
        { expiresIn: isTemp ? '5m' : process.env.JWT_EXPIRES_IN }
    );
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبة" });
    }

    try {
        const hashedEmail = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
        
        const myUser = await User.findOne({ email: hashedEmail });
        if (!myUser) {
            return res.status(404).json({ error: "المستخدم غير موجود" });
        }

        const isCorrect = await myUser.correctPassword(password);
        if (!isCorrect) {
            return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
        }

        if (myUser.isMfaEnabled) {
            const tempToken = signToken(myUser, true);
            return res.status(200).json({
                requireMfa: true,
                tempToken: tempToken
            });
        }

        const token = signToken(myUser);
        res.status(200).json({
            jwt: token,
            role: myUser.role,
            name: myUser.name
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setupMfa = async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({ name: `StoreAPI (${req.user.name})` });
        const dataUrl = await qrcode.toDataURL(secret.otpauth_url);
        
        req.user.mfaSecret = secret.base32;
        await req.user.save();
        
        res.status(200).json({
            secret: secret.base32,
            qrCode: dataUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyMfa = async (req, res) => {
    const { token, tempToken } = req.body;
    
    try {
        let userId;
        let user;
        if (req.user) {
            // Already authenticated, just turning MFA on
            userId = req.user._id;
            user = req.user;
        } else if (tempToken) {
            // Verifying during login
            const decoded = jwt.verify(tempToken, process.env.SECRET_KEY);
            if (!decoded.isTemp) return res.status(401).json({ error: "Invalid token type" });
            userId = decoded.id;
            user = await User.findById(userId);
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!user || !user.mfaSecret) {
            return res.status(400).json({ error: "MFA is not setup for this user" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            if (!user.isMfaEnabled) {
                user.isMfaEnabled = true;
                await user.save();
            }
            // If verifying for login, issue a real token
            if (tempToken) {
                const finalToken = signToken(user);
                return res.status(200).json({
                    jwt: finalToken,
                    role: user.role,
                    name: user.name
                });
            }
            return res.status(200).json({ message: "MFA verified and enabled successfully." });
        } else {
            return res.status(400).json({ error: "Invalid MFA code" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
