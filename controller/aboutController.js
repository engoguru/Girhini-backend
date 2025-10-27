import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import About from '../models/aboutModel.js';
// cloudinary.config({
//   cloud_name: "dlntaougd",
//   api_key: "146485128726459",
//   api_secret: "yO1GsbBFJVA9_dzNrPqbFZZBAtw",
// });


cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer, folder = "about", resource_type = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },  // ← auto detects images, videos, etc.
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};


export const createAbout = async (req, res) => {
  try {
    const {
      heading,
      content,
      savings,
      totalRaised,
      communityReached,
      targetAchived,
    } = req.body;

    const aboutImage = req.files["aboutImage"]?.[0]
      ? await uploadToCloudinary(req.files["aboutImage"][0].buffer, "about", "image")
      : null;

    const aboutVideo = req.files["aboutVideo"]?.[0]
      ? await uploadToCloudinary(req.files["aboutVideo"][0].buffer, "about", "video")
      : null;

    const volunteerImageFiles = req.files["volunteerImage"] || [];
    const volunteerImage = await Promise.all(
      volunteerImageFiles.map((file) =>
        uploadToCloudinary(file.buffer, "about", "image")
      )
    );

    const about = new About({
      aboutImage,
      aboutVideo,
      volunteerImage,
      AboutContent: {
        heading,
        content,
      },
      achived: {
        savings,
        totalRaised,
        communityReached,
        targetAchived,
      },
    });

    await about.save();
    res.status(201).json({ message: "About created", about });
  } catch (error) {
    console.error("Create About error", error);
    res.status(500).json({ error: "Failed to create about data" });
  }
};

export const getAllAbout = async (req, res) => {
  try {
    const about = await About.find().sort({ createdAt: -1 });
    res.status(200).json({ about });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const { id } = req.params;

    const about = await About.findById(id);
    if (!about) return res.status(404).json({ error: "About entry not found" });

    const {
      heading,
      content,
      savings,
      totalRaised,
      communityReached,
      targetAchived,
      
    } = req.body;

    // Upload and replace aboutImage if provided
    if (req.files["aboutImage"]?.[0]) {
      if (about.aboutImage?.public_id) {
        await cloudinary.uploader.destroy(about.aboutImage.public_id);
      }
      about.aboutImage = await uploadToCloudinary(req.files["aboutImage"][0].buffer);
    }

    // Upload and replace aboutVideo if provided
    if (req.files["aboutVideo"]?.[0]) {
      if (about.aboutVideo?.public_id) {
        await cloudinary.uploader.destroy(about.aboutVideo.public_id);
      }
      about.aboutVideo = await uploadToCloudinary(req.files["aboutVideo"][0].buffer);
    }

    // Upload new volunteerImages (optional - you may want to clear previous manually)
    if (req.files["volunteerImage"]?.length) {
      // Optional: delete old ones
      for (const img of about.volunteerImage) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }
      about.volunteerImage = await Promise.all(
        req.files["volunteerImage"].map((file) => uploadToCloudinary(file.buffer))
      );
    }

    about.AboutContent = {
      heading: heading || about.AboutContent.heading,
      content: content || about.AboutContent.content,
    };

    about.achived = {
      savings: savings || about.achived.savings,
      totalRaised: totalRaised || about.achived.totalRaised,
      communityReached: communityReached || about.achived.communityReached,
      targetAchived: targetAchived || about.achived.targetAchived,
    };

    await about.save();

    res.status(200).json({ message: "About entry updated", about });
  } catch (error) {
    console.error("Update About error", error);
    res.status(500).json({ error: "Failed to update About" });
  }
};











export const deleteAbout = async (req, res) => {
  try {
    const { id } = req.params;
    const about = await About.findById(id);
    if (!about) return res.status(404).json({ error: "Not found" });

    if (about.aboutImage?.public_id)
      await cloudinary.uploader.destroy(about.aboutImage.public_id);

    if (about.aboutVideo?.public_id)
      await cloudinary.uploader.destroy(about.aboutVideo.public_id);

    if (about.volunteerImage?.length) {
      for (const img of about.volunteerImage) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await About.findByIdAndDelete(id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};
