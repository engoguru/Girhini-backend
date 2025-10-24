import express from "express";
// import { registerUser, verifyOtp, loginUser } from "../controllers/authController.js";
import { registerUser,verifyOtp,loginUser } from "../controller/userController.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/verify-otp", verifyOtp);
userRoutes.post("/login", loginUser);

export default userRoutes;
