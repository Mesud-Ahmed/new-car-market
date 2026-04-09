"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const config_1 = require("./config");
cloudinary_1.v2.config({
    cloud_name: config_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.env.CLOUDINARY_API_KEY,
    api_secret: config_1.env.CLOUDINARY_API_SECRET,
});
function validateRemoteFileUrl(fileUrl) {
    let parsed;
    try {
        parsed = new URL(fileUrl);
    }
    catch {
        throw new Error('Invalid photo URL');
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Photo URL must use HTTP(S)');
    }
}
const uploadToCloudinary = async (fileUrl) => {
    validateRemoteFileUrl(fileUrl);
    const result = await cloudinary_1.v2.uploader.upload(fileUrl, {
        folder: 'autoflow-ethiopia',
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
            {
                overlay: 'text:Arial_60_bold:freedom%20car%20sale',
                gravity: 'south_east',
                opacity: 60,
                color: 'white',
                x: 30,
                y: 30,
            },
        ],
    });
    return result.secure_url;
};
exports.uploadToCloudinary = uploadToCloudinary;
