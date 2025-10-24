import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^[0-9]{10}$/, "Contact number must be 10 digits"],
    },
    category: {
      type: String,
      enum: ["general", "support", "feedback", "other","donation"],
      default: "general",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [10, "Message must be at least 10 characters long"],
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("ContactData", contactSchema);

export default  Contact

