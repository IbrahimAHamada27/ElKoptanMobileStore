const product = require('../models/product.model');
const { Setting } = require('../models/setting.model');
const sharp = require('sharp');

exports.getProducts = async (req, res) => {
    try {
        const { category, isBestSeller, isNewProduct } = req.query;
        let query = {};
        if (category) query.category = category;
        if (isBestSeller === 'true') query.isBestSeller = true;
        if (isNewProduct === 'true') query.isNewProduct = true;

        if (req.query.page || req.query.limit) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const skip = (page - 1) * limit;

            const total = await product.countDocuments(query);
            const products = await product.find(query).select('-__v').sort({ orderIndex: 1 }).skip(skip).limit(limit).lean();

            res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
            return res.status(200).json({
                massage: 'product list',
                data: products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }

        const products = await product.find(query).select('-__v').sort({ orderIndex: 1 }).lean();
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        res.status(200).json({massage : 'product list', data: products});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.addProduct = async (req, res) => {
    try {
        const {name, price, discountPrice, category, isNewProduct, isBestSeller, desc, stock, slug} = req.body;
        
        if (!req.file) return res.status(400).json({error: 'Image is required'});
        
        const compressedBuffer = await sharp(req.file.buffer)
            .resize({ width: 600, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 65 })
            .toBuffer();

        const base64Data = compressedBuffer.toString('base64');
        const imagURL = `data:image/jpeg;base64,${base64Data}`;

        const myProduct = await product.create({
            name, 
            price: Number(price), 
            discountPrice: discountPrice ? Number(discountPrice) : undefined,
            category: category || 'phone',
            isNewProduct: isNewProduct === 'true' || isNewProduct === true,
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            desc, 
            stock: Number(stock), 
            imagURL, 
            slug
        });
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
        const updateData = { ...req.body };
        if(req.file) {
            const compressedBuffer = await sharp(req.file.buffer)
                .resize({ width: 600, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 65 })
                .toBuffer();
            const base64Data = compressedBuffer.toString('base64');
            updateData.imagURL = `data:image/jpeg;base64,${base64Data}`;
        }
        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.discountPrice !== undefined) {
            updateData.discountPrice = updateData.discountPrice ? Number(updateData.discountPrice) : null;
        }
        if (updateData.stock) updateData.stock = Number(updateData.stock);
        if (updateData.isNewProduct !== undefined) {
            updateData.isNewProduct = updateData.isNewProduct === 'true' || updateData.isNewProduct === true;
        }
        if (updateData.isBestSeller !== undefined) {
            updateData.isBestSeller = updateData.isBestSeller === 'true' || updateData.isBestSeller === true;
        }

        const updated = await product.findByIdAndUpdate(id, updateData, { new: true });
        if(!updated) return res.status(404).json({error:'product not found'});
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

        // Also clean up from Setting (featured_products)
        await Setting.updateOne(
          { key: 'featured_products' },
          { 
            $pull: { 
              'value.home': id, 
              'value.offers': id 
            } 
          }
        );

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
        res.status(200).json({massage: 'Products reordered successfully'});
    } catch (err) {
        res.status(500).json({error: 'Failed to reorder'});
    }
}
