
import dotenv from "dotenv";
dotenv.config();

import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
console.log(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper: Generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ==============================
   REGISTER USER — Send OTP via WhatsApp
============================== */
export const registerUser = async (req, res) => {
  try {
    const { name, email, whatsAppNumber, password } = req.body;

    if (!name || !email || !whatsAppNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({
      $or: [{ email }, { "whatsAppNumber.number": whatsAppNumber }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or WhatsApp number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    //  Create a new user with OTP stored
    const newUser = new userModel({
      name,
      email,
      whatsAppNumber: {
        number: whatsAppNumber,
        otp,
        otpExpires,
        isVerified: false,
      },
      password: hashedPassword,
    });

    await newUser.save();

    //  Send OTP via WhatsApp using Twilio
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${whatsAppNumber}`,
      body: `Your Girni verification code is: ${otp}. It expires in 5 minutes.`,
    });

    res.status(201).json({
      message: "OTP sent to your WhatsApp number. Please verify to complete registration.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* ==============================
   VERIFY OTP — Confirm & Activate
============================== */
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { otp: storedOtp, otpExpires } = user.whatsAppNumber;

    if (!storedOtp || otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    //  Mark verified and clear OTP
    user.whatsAppNumber.isVerified = true;
    user.whatsAppNumber.otp = null;
    user.whatsAppNumber.otpExpires = null;
    await user.save();

    //  Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "WhatsApp number verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        whatsAppNumber: user.whatsAppNumber.number,
        isVerified: user.whatsAppNumber.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* ==============================
   LOGIN — Only if Verified
============================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.whatsAppNumber.isVerified) {
      return res.status(403).json({
        message: "Please verify your WhatsApp number before login",
        verified: false,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,                      // MongoDB _id
        email: user.email,  
        role:user.role    ,            // email
        whatsAppNumber: user.whatsAppNumber?.number, // optional chaining in case it’s undefined
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true, // prevents client JS access (recommended)
      secure: process.env.NODE_ENV === "production", // send cookie only over https in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        whatsAppNumber: user.whatsAppNumber.number,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

