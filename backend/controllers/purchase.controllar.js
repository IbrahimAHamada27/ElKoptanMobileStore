const purchase = require('../models/purchase.models');
const Product = require('../models/product.model');

exports.addPurchase = async (req, res) => {
    try {
        const userId = req.user.id;
        const {product, quantity } = req.body;
        
        if(!quantity || quantity <= 0) return res.status(400).json({error: 'Invalid quantity'});

        const myProduct = await Product.findById(product);
        if(!myProduct) 
            return res.status(404).json({error:'product not found'});
            
        if(myProduct.stock < quantity)
            return res.status(400).json({error:'Not enough stock available'});

        const myPurchase = await purchase.create({user: userId, product, quantity, price: myProduct.price});
        
        // Reduce product stock
        myProduct.stock -= quantity;
        await myProduct.save();

        res.status(201).json({massage:'purchase added' , data:myPurchase});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.getAllPurchases = async (req, res) => {
    try {
        const myPurchases = await purchase.find().populate('user product', 'name imgURL email');
        res.status(200).json({massage : 'purchase list', data: myPurchases});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.userPurchases = async (req, res) => {
    try {
        const userId = req.user.id;
        const myPurchases = await purchase.find({user: userId});
        res.status(200).json({massage : 'purchase list', data: myPurchases});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}