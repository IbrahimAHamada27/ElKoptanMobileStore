const product = require('../models/product.model');

let cachedProducts = null;
const clearCache = () => { cachedProducts = null; };

exports.getProducts = async (req, res) => {
    try {
        if (cachedProducts) {
            return res.status(200).json({massage : 'product list', data: cachedProducts});
        }
        const products = await product.find().sort({ orderIndex: 1 }).lean();
        cachedProducts = products;
        res.status(200).json({massage : 'product list', data: products});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.addProduct = async (req, res) => {
    try {
        const {name, price, desc, stock, slug} = req.body;
        
        if (!req.file) return res.status(400).json({error: 'Image is required'});
        
        const base64Data = req.file.buffer.toString('base64');
        const imagURL = `data:${req.file.mimetype};base64,${base64Data}`;

        const myProduct = await product.create({name, price, desc, stock, imagURL, slug});
        clearCache();
        res.status(201).json({massage:'product added' , data:myProduct});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getProductsBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const myProducts = await product.findOne({slug});

        if(!myProducts) return res.status(404).json({error:'product not found'});

        res.status(200).json({massage : `product with slug ${slug}`, data: myProducts});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if(req.file) {
            const base64Data = req.file.buffer.toString('base64');
            updateData.imagURL = `data:${req.file.mimetype};base64,${base64Data}`;
        }
        const updated = await product.findByIdAndUpdate(id, updateData, { new: true });
        if(!updated) return res.status(404).json({error:'product not found'});
        clearCache();
        res.status(200).json({massage : 'product updated', data: updated});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await product.findByIdAndDelete(id);
        if(!deleted) return res.status(404).json({error:'product not found'});
        clearCache();
        res.status(200).json({massage : 'product deleted'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.reorderProducts = async (req, res) => {
    const { orders } = req.body;
    if(!orders || !Array.isArray(orders)) return res.status(400).json({error: 'Invalid data'});
    
    try {
        for (const item of orders) {
            await product.findByIdAndUpdate(item.id, { orderIndex: item.orderIndex });
        }
        clearCache();
        res.status(200).json({massage: 'Products reordered successfully'});
    } catch (err) {
        res.status(500).json({error: 'Failed to reorder'});
    }
}
