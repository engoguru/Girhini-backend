
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import galleryModel from "../models/galleryModel.js";

// Configure Cloudinary (use .env in production)
// cloudinary.config({
//   cloud_name: "dlntaougd",
//   api_key: "146485128726459",
//   api_secret: "yO1GsbBFJVA9_dzNrPqbFZZBAtw",
// });
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});


// Upload Multiple Images to Cloudinary (inline function)
const uploadMultipleToCloudinary = async (files, folder = "Gallery") => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided for upload");
    }

    const uploadPromises = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                return reject(error);
              }

              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );

          stream.end(file.buffer); // Stream the file buffer
        })
    );

    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages; // Array of { url, public_id }
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload multiple images to Cloudinary");
  }
};

// Controller to create gallery
export const createGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const galleryImages = await uploadMultipleToCloudinary(req.files, "Gallery");

    const newGallery = new galleryModel({
      galleryImage: galleryImages, // Array of { url, public_id }
    });

    await newGallery.save();

    res.status(201).json({
      success: true,
      message: "Gallery created successfully",
      data: newGallery,
    });
  } catch (error) {
    console.error("Error creating gallery:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// GET all galleries
export const getAllGallery = async (req, res) => {
  try {
    const galleries = await galleryModel.find().sort({ createdAt: -1 }); // optional: newest first
    res.status(200).json(galleries);
  } catch (error) {
    console.error("Error fetching galleries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch galleries",
      error: error.message,
    });
  }
};

//  UPDATE gallery: delete selected images + upload new ones
export const updateGallery = async (req, res) => {
  try {
    const { id } = req.params; // MongoDB document ID
    const { deletePublicIds } = req.body; // Array of public_id strings to delete

    const gallery = await galleryModel.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    // === 1. Delete images from Cloudinary ===
    if (Array.isArray(deletePublicIds) && deletePublicIds.length > 0) {
      await Promise.all(
        deletePublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId)
        )
      );

      // Remove them from galleryImage array
      gallery.galleryImage = gallery.galleryImage.filter(
        (img) => !deletePublicIds.includes(img.public_id)
      );
    }

    // === 2. Upload new images (if any) ===
    if (req.files && req.files.length > 0) {
      const newUploads = await uploadMultipleToCloudinary(req.files, "Gallery");
      gallery.galleryImage.push(...newUploads);
    }

    // === 3. Save updates ===
    const updatedGallery = await gallery.save();

    res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      data: updatedGallery,
    });
  } catch (error) {
    console.error("Error updating gallery:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
