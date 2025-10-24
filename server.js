
import dotenv from "dotenv";
import express from "express";

import cors from 'cors';
import connectDB from "./DB/connectDB.js";

import conatctRoute from "./routes/contactRoutes.js";
import programRoute from "./routes/programRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import aboutRouter from "./routes/aboutRoutes.js";
import userRoutes from "./routes/userRoutes.js";

//Load environment variables
dotenv.config();


const app = express();
const PORT = 4500;

// Health check route

// Middleware to parse JSON requests
// CORS
const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
// DB

connectDB()


app.get("/check", (req, res) => {
  res.status(200).json({
    message: "Running..."
  });
});

app.use("/api/contact",conatctRoute);

app.use("/api/program",programRoute);

app.use("/api/blog",blogRoutes);

app.use("/api/gallery",galleryRoutes);

app.use("/api/review",reviewRoutes)

app.use("/api/about",aboutRouter)

app.use("/api/auth",userRoutes)

// twilliorecovercode=CV2NB9P756JL3PV1Y1M3V9TL   
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
