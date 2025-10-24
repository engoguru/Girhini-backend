// models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    blogImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    heading: {
      type: String,
      required: [true, "Heading is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Education", "Health", "Humanitarian", "Environment", "Animal Welfare"],
    },
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("Blog", blogSchema);
export default BlogModel;
