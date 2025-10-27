import express from "express";
// import { registerUser, verifyOtp, loginUser } from "../controllers/authController.js";
import { registerUser,verifyOtp,loginUser } from "../controller/userController.js";
import { authorization } from "../utils/authorization.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/verify-otp", verifyOtp);
userRoutes.post("/login", loginUser);


// Protected route - returns user info from token
userRoutes.get("/get", authorization, (req, res) => {
 
  try {
    // req.user contains decoded info from JWT
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});



//  Logout API
userRoutes.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
});

export default userRoutes;
