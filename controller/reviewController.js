import { v2 as cloudinary } from "cloudinary";
import Review from "../models/reviewModel.js";
cloudinary.config({
  cloud_name: "dlntaougd",
  api_key: "146485128726459",
  api_secret: "yO1GsbBFJVA9_dzNrPqbFZZBAtw",
});
// Upload single image to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blogs" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
}



export const createReview = async (req, res) => {
  try {
    const { name, country, organization, rating, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    const newReview = new Review({
      name,
      country,
      organization,
      rating,
      description,
      profileImage: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });

    await newReview.save();

    res.status(201).json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};




export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      message: "Reviews fetched successfully",
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};








export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(review.profileImage.public_id);

    // Delete from MongoDB
    await Review.findByIdAndDelete(id);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
