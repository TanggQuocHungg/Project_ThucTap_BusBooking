let multer = require('multer');
let path = require('path');

// Cau hinh noi luu tru va ten file
let storageSetting = multer.diskStorage({
    destination: function (req, file, cb) {
        // Luon luu vao thu muc uploads o goc du an
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        let filename = Date.now() + '-' + Math.round(Math.random() * 1000000000) + ext;
        cb(null, filename);
    }
})

// Bo loc chi cho phep upload hinh anh
let filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('file sai dinh dang, chi chap nhan hinh anh'));
    }
}

module.exports = {
    uploadImage: multer({
        storage: storageSetting,
        limits: { fileSize: 5 * 1024 * 1024 }, // Gioi han dung luong 5MB
        fileFilter: filterImage
    })
}