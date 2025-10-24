import express from 'express';
import multer from 'multer';
import { createAbout, deleteAbout, getAllAbout, updateAbout } from '../controller/aboutController.js';


const aboutRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

aboutRouter.post(
  "/create",
  upload.fields([
    { name: "aboutImage", maxCount: 1 },
    { name: "aboutVideo", maxCount: 1 },
    { name: "volunteerImage", maxCount: 10 },
  ]),
  createAbout
);

aboutRouter.get("/getAll", getAllAbout);

aboutRouter.put(
  "/update/:id",
  upload.fields([
    { name: "aboutImage", maxCount: 1 },
    { name: "aboutVideo", maxCount: 1 },
    { name: "volunteerImage", maxCount: 10 },
  ]),
 updateAbout
);



aboutRouter.delete("/delete/:id",deleteAbout);

export default aboutRouter;
