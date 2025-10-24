import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: false,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  },
  {
    timestamps: true, // <-- Corrected syntax: was missing `: true`
  }
);

// Optional: Export model
const Review = mongoose.model("Review", reviewSchema);
export default Review;
