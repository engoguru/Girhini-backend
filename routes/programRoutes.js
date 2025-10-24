import express from "express";

import path from "path";
import { createProgram, deleteProgram, getProgramById, getPrograms, updateProgram } from "../controller/programController.js";



import multer from "multer";
const programRoute = express.Router();
const upload = multer({ storage: multer.memoryStorage() });



programRoute.post("/create",upload.array("programImage",10),createProgram);     
programRoute.get("/get",getPrograms);        
programRoute.get("/getOne/:id",getProgramById);  
programRoute.put("/update/:id",upload.array("programImage",10),updateProgram);   
programRoute.delete("/delete/:id",deleteProgram); 

export default programRoute;
