const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/product.model');
require('dotenv').config();

const { connectDB } = require('./config/db.config');

const demoImagesPath = path.join(__dirname, '../imges demo');
const uploadsPath = path.join(__dirname, 'uploads');

async function seed() {
    await connectDB();
    
    console.log('Connected to DB. Deleting old products...');
    await Product.deleteMany({});
    
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath);
    }
    
    console.log('Reading demo images...');
    let files = fs.readdirSync(demoImagesPath);
    files = files.filter(f => f.match(/\.(jpg|jpeg|png|webp|avif)$/i));
    
    const categories = ['phone', 'accessory'];
    const targetCount = 100;
    
    for (let i = 1; i <= targetCount; i++) {
        const file = files[i % files.length];
        
        const ext = path.extname(file);
        const newFileName = `demo-${i}${ext}`;
        const srcPath = path.join(demoImagesPath, file);
        const destPath = path.join(uploadsPath, newFileName);
        
        // Copy file
        fs.copyFileSync(srcPath, destPath);
        
        const category = categories[i % 2];
        const price = Math.floor(Math.random() * 20000) + 1000;
        const discountPrice = Math.random() > 0.5 ? Math.floor(price * 0.9) : undefined;
        
        await Product.create({
            name: `منتج تجريبي ${i} - ${category === 'phone' ? 'هاتف' : 'اكسسوار'}`,
            price: price,
            discountPrice: discountPrice,
            category: category,
            isNewProduct: Math.random() > 0.7,
            isBestSeller: Math.random() > 0.7,
            orderIndex: i,
            desc: `هذا المنتج التجريبي رقم ${i} هو منتج رائع ذو مواصفات ممتازة ومناسب لاحتياجاتك. يتميز بخامات عالية الجودة وتصميم عصري يرضي جميع الأذواق.`,
            imagURL: `uploads/${newFileName}`,
            stock: Math.floor(Math.random() * 50) + 1,
            slug: `demo-product-${i}-${Date.now()}`
        });
    }
    
    console.log(`Seeding complete! Added ${targetCount} products.`);
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
