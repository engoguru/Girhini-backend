import  express from "express";
const blogRoutes=express.Router()
import multer from "multer";
import { createBlog, getAllBlogs, getBlogById } from "../controller/blogController.js";
const upload = multer({ storage: multer.memoryStorage() });

blogRoutes.post("/create",upload.single("blogImage"),createBlog)
blogRoutes.get("/getAll",getAllBlogs)

blogRoutes.get("/getOne/:id",getBlogById)

export default blogRoutes