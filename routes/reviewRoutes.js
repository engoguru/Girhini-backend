import express from 'express';
const reviewRoutes=express.Router()


import multer from "multer";
import { createReview, deleteReview, getAllReviews } from '../controller/reviewController.js';

const storage = multer.memoryStorage(); // store in memory for direct buffer access
const upload = multer({ storage });

reviewRoutes.post("/create", upload.single("profileImage"),createReview);



reviewRoutes.get("/getAll",getAllReviews)




reviewRoutes.delete("/delete/:id",deleteReview)

export default reviewRoutes