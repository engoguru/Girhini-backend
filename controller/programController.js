import Program from "../models/programModel.js";
import { v2 as cloudinary } from "cloudinary";



cloudinary.config({
  cloud_name: "dlntaougd",
  api_key: "146485128726459",
  api_secret: "yO1GsbBFJVA9_dzNrPqbFZZBAtw",
});





// ✅ CREATE Program

// Controller
// Controller
export const createProgram = async (req, res) => {
  try {
    const {
      programHeading,
      programDescription,
      targetFund,
      raisedFund,
      lastDate,
      programType,
      status,
      objective,   // new field
      impacted     // new field
    } = req.body;

    // Validation
    if (!programHeading || !programDescription || !targetFund || !lastDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const programImages = [];

    // Upload function for Cloudinary
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "programs" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    // Upload files to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        programImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // Parse 'objective' and 'impacted' fields if they are coming as JSON strings
    let parsedObjectives = [];
    let parsedImpacts = [];

    if (objective) {
      parsedObjectives = typeof objective === "string" ? JSON.parse(objective) : objective;
    }

    if (impacted) {
      parsedImpacts = typeof impacted === "string" ? JSON.parse(impacted) : impacted;
    }

    // Save to MongoDB
    const newProgram = await Program.create({
      programImage: programImages,
      programHeading,
      programDescription,
      targetFund,
      raisedFund: raisedFund || 0,
      lastDate,
      programType,
      status: status || "active",
      objective: parsedObjectives,
      impacted: parsedImpacts,
    });

    return res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: newProgram,
    });
  } catch (error) {
    console.error("Program creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// ✅ READ All Programs
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ READ Single Program
export const getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program)
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE Program


// ✅ UPDATE Program (with Image, Objective & Impact Handling)
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      programHeading,
      programDescription,
      targetFund,
      raisedFund,
      lastDate,
      programType,
      status,
      existingImages,
      objective,
      impacted,
    } = req.body;

    // ======== 1️⃣ Find Program ========
    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // ======== 2️⃣ Handle Existing Images ========
    let updatedImages = [];
    if (existingImages) {
      try {
        updatedImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid existingImages format. Must be a JSON array.",
        });
      }
    }

    // ======== 3️⃣ Upload New Images (if any) ========
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "programs" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        updatedImages.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        });
      }
    }

    // ======== 4️⃣ Delete Unused Old Images ========
    const oldImages = program.programImage || [];
    const removedImages = oldImages.filter(
      (img) => !updatedImages.find((u) => u.public_id === img.public_id)
    );

    for (const img of removedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.error("⚠️ Error deleting Cloudinary image:", err.message);
      }
    }

    // ======== 5️⃣ Parse Objectives & Impacted Fields ========
    let parsedObjectives = program.objective;
    let parsedImpacted = program.impacted;

    try {
      if (objective) {
        parsedObjectives =
          typeof objective === "string" ? JSON.parse(objective) : objective;
      }

      if (impacted) {
        parsedImpacted =
          typeof impacted === "string" ? JSON.parse(impacted) : impacted;
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid format for objectives or impacted fields. Must be JSON.",
      });
    }

    // ======== 6️⃣ Update Program Fields ========
    Object.assign(program, {
      programHeading: programHeading ?? program.programHeading,
      programDescription: programDescription ?? program.programDescription,
      targetFund: targetFund ?? program.targetFund,
      raisedFund: raisedFund ?? program.raisedFund,
      lastDate: lastDate ?? program.lastDate,
      programType: programType ?? program.programType,
      status: status ?? program.status,
      programImage: updatedImages,
      objective: parsedObjectives,
      impacted: parsedImpacted,
    });

    // ======== 7️⃣ Save Updated Program ========
    await program.save();

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    console.error("❌ Error updating program:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};



export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the program first
    const program = await Program.findById(id);
    if (!program) {
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }

    // ✅ Delete all Cloudinary images linked to the program
    if (program.programImage && program.programImage.length > 0) {
      for (const img of program.programImage) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (err) {
          console.error(`Failed to delete image ${img.public_id}:`, err.message);
        }
      }
    }

    // ✅ Now delete program from database
    await Program.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Program and all associated images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};









