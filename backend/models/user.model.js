const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchma = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:['admin', 'superadmin', 'user'],
        default: 'user'
    },
    mfaSecret: {
        type: String,
        default: null
    },
    isMfaEnabled: {
        type: Boolean,
        default: false
    }
});

// Async pre-save hooks in modern Mongoose resolve automatically via Promises
// We must not declare the 'next' parameter or call 'next()'
userSchma.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.isModified('email')) {
        this.email = crypto.createHash('sha256').update(this.email.trim().toLowerCase()).digest('hex');
    }
    if (this.isModified('name')) {
        this.name = crypto.createHash('sha256').update(this.name.trim()).digest('hex');
    }
});

userSchma.methods.correctPassword = async function(inputPassword){
    return await bcrypt.compare(inputPassword, this.password);
}

module.exports = mongoose.model('User', userSchma);