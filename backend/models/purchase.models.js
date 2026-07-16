const mongoose = require('mongoose');
const purchaseSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },


    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    purchasedAt: {
        type: Date,
        default: Date.now
    }},
    {

        timestamps: true
    });

    module.exports = mongoose.model('purchase', purchaseSchema);