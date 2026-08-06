const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const sharp = require('sharp');
const Product = require('./models/product.model');

async function compressExistingProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully.');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;
        for (const prod of products) {
            if (prod.imagURL && prod.imagURL.startsWith('data:')) {
                const base64Parts = prod.imagURL.split(',');
                if (base64Parts.length === 2) {
                    const rawBase64 = base64Parts[1];
                    const buffer = Buffer.from(rawBase64, 'base64');
                    
                    try {
                        const compressedBuffer = await sharp(buffer)
                            .resize({ width: 600, fit: 'inside', withoutEnlargement: true })
                            .webp({ quality: 60, effort: 6 })
                            .toBuffer();

                        const compressedBase64 = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
                        if (compressedBase64.length < prod.imagURL.length || !prod.imagURL.startsWith('data:image/webp;')) {
                            prod.imagURL = compressedBase64;
                            await prod.save();
                            updatedCount++;
                            console.log(`[${updatedCount}] Compressed image for product: ${prod.name} (${(buffer.length / 1024).toFixed(1)}KB -> ${(compressedBuffer.length / 1024).toFixed(1)}KB)`);
                        }
                    } catch (err) {
                        console.error(`Failed to compress image for product ${prod._id}: ${err.message}`);
                    }
                }
            }
        }

        console.log(`\nSuccess! Compressed ${updatedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

compressExistingProducts();
