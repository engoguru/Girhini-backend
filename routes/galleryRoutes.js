import express from 'express'
import multer from "multer";
import { createGallery, getAllGallery, updateGallery } from '../controller/galleryController.js';


const galleryRoutes =express.Router()

const upload = multer({ storage: multer.memoryStorage() });

galleryRoutes.post("/create",upload.array("galleryImage",20),createGallery)

galleryRoutes.get("/getAll",getAllGallery);

galleryRoutes.put("/update/:id",upload.array("galleryImage",20),updateGallery)

export default galleryRoutes;