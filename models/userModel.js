import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email address",
    },
  },
  whatsAppNumber: {
    number: {
      type: String,
      required: [true, "WhatsApp number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: (value) =>
          validator.isMobilePhone(value, "any", { strictMode: false }),
        message: "Please enter a valid WhatsApp number",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
}, { timestamps: true });

const userModel = mongoose.model("userData", userSchema);
export default userModel;
