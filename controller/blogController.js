// controllers/blogController.js
import BlogModel from "../models/blogModel.js";
import { v2 as cloudinary } from "cloudinary";
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
};

export const createBlog = async (req, res) => {
  try {
    const { heading, description, category } = req.body;

    // Validation
    if (!heading || !description || !category) {
      return res.status(400).json({ message: "Heading, description, and category are required" });
    }

    // Optional: Validate category against allowed values
    const allowedCategories = [
      "Education",
      "Health",
      "Humanitarian",
      "Environment",
      "Animal Welfare",
    ];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category selected" });
    }

    // Upload image to Cloudinary
    let blogImage = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      blogImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } else {
      return res.status(400).json({ message: "Blog image is required" });
    }

    // Create and save blog
    const blog = new BlogModel({
      heading,
      description,
      category,
      blogImage,
    });

    await blog.save();

    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get All Blogs with Pagination
export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await BlogModel.countDocuments();
    const blogs = await BlogModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Blog
export const getBlogById = async (req, res) => {
  console.log(req.params.id,"hghg")
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    console.log(blog,"bheb")
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { heading, description, blogImage } = req.body;
    const blog = await BlogModel.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.heading = heading || blog.heading;
    blog.description = description || blog.description;
    blog.blogImage = blogImage || blog.blogImage;

    await blog.save();

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
