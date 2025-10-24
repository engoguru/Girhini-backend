import express from "express";
import { createContact, deleteContact, getContactById, getContacts, updateContact } from "../controller/contactController.js";

const conatctRoute=express.Router();


conatctRoute.post("/create",createContact);
conatctRoute.get("/get", getContacts);
conatctRoute.get("/getOne/:id", getContactById);
conatctRoute.put("/update/:id", updateContact);
conatctRoute.delete("/delete/:id", deleteContact);




export default conatctRoute;