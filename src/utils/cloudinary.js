import {v2 as cloudinary} from "cloudinary"

import fs from "fs"

import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("File is uploaded on cloudinary", response.url)
        return response
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        
        if (fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
                console.log("Local file deleted successfully");
            } catch (unlinkError) {
                console.error("Error deleting local file:", unlinkError.message);
            }
        }

        throw new Error("Cloudinary upload failed");
    }
}

export {uploadOnCloudinary}