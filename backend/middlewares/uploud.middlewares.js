const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [
      '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', 
      '.bmp', '.tiff', '.tif', '.ico', '.heic', '.heif', '.jfif', 
      '.pjpeg', '.pjp', '.svgz'
    ];

    // Accept if MIME type starts with image/ OR extension is in allowedExt list
    if ((file.mimetype && file.mimetype.startsWith('image/')) || allowedExt.includes(ext)) {
        return cb(null, true);
    }

    return cb(new Error('مسموح بملفات الصور فقط بجميع الامتدادات (JPG, PNG, WEBP, AVIF, GIF, SVG, BMP, HEIC...)'));
};

const storage = multer.memoryStorage();
const MB = 1024 * 1024;

module.exports = multer({
    storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 15 * MB } // Increase limit to 15MB for high quality images
});
