const mongoose = require('mongoose');



const productSchema = new mongoose.Schema({




    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        default: 'phone'
    },
    isNewProduct: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    orderIndex: {
        type: Number,
        default: 0
    },
    desc: {
        type: String,
        required: true
    },
    imagURL: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
},

{
    timestamps: true}
);


module.exports = mongoose.model('Product', productSchema);