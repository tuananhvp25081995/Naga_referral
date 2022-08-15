const cloudinary  = require("cloudinary");
const  multer = require("multer");
const  path = require("path");
const  fs = require("fs");
const  os = require("os");

const NUMBER = '0123456789'

function randomString(length, chars) {
    const result = [];
    const len = chars.length;
    for (let i = length; i > 0; --i) {
        result[i] = chars[Math.floor(Math.random() * len)];
    }
    return result.join('');
}

const dir = os.homedir() + "/Desktop/UPLOAD";

const storage = multer.diskStorage({
    destination: (req , file , res ) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive : true});
        } 
        res(null, dir);
    },
    filename : (req , file , res ) => {
        res(null, file.fieldname + "-" + randomString(16,NUMBER) + path.extname(file.originalname));
    }
})
const fileFilter = (req, file, res) => {
    if (["image/jpg", "image/jpeg", "image/png", "image/bmp"].includes(file.mimetype)) {
        res(null, true);
    }
};

export const upload = multer({
    storage : storage, 
    fileFilter : fileFilter
});

export async function UploadPhoto(path) {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    })

    return cloudinary.v2.uploader.upload(path, {upload_preset: config.cloudinary.preset}, (err, result) =>{
       if (err) console.log(err);
       else return result;
    });
}