const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.jpg', '.png', '.jpeg','.webp'];
    if(!allowedExt.includes(ext)) {
        return cb(new Error('only images are allowed'));
    }
    console.log('filter');
    
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
        console.log('distination');
    },
    filename: (req, file, cb) => {
        cb(null,Date.now()+'_', file.originalname);
        console.log('filename'); 
    }
});

const MG = 1024*1024;
module.exports= multer({storage, fileFilter: fileFilter, limits: {fileSize: 2*MG}});



