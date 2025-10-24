import mongoose from "mongoose";

// Define subdocument schema for objectives
const ObjectiveSchema = new mongoose.Schema({
  heading: {
    type: String,
  
    trim: true,
  },
  description: {
    type: String,
 
    trim: true,
  }
}, { _id: false });
const ImpactSchema = new mongoose.Schema({
  heading: {
    type: String,
 
    trim: true,
  },
  NumberImapct: {
    type: String,
  
    trim: true,
  }
}, { _id: false });

const programSchema = new mongoose.Schema(
    {
        programImage: [
            {
                url: String,
                public_id: String,
            }
        ],
        programHeading: {
            type: String,
            required: [true, "Program heading is required"],
            trim: true,
            minlength: [5, "Heading must be at least 5 characters long"],
        },
        programDescription: {
            type: String,
            default: 0,
            required: [true, "Program description is required"],
            minlength: [20, "Description must be at least 20 characters long"],
        },
        targetFund: {
            type: Number,
            required: [true, "Target fund is required"],
            min: [0, "Target fund cannot be negative"],
        },
        raisedFund: {
            type: Number,
            default: 0,
            min: [0, "Raised fund cannot be negative"],
        },
        lastDate: {
            type: Date,
            //   required: [true, "Last date is required"],
        },
        programType: {
            type: String,
            enum: ["education", "healthcare", "environment", "animal", "other","Feature","Causes"],
            required: [true, "Program type is required"],
            default: "other",
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled","inactive"],
            default: "active",
        },
        objective: [ObjectiveSchema],
        impacted: [ImpactSchema],
    },
    { timestamps: true }
);

const Program = mongoose.model("ProgramData", programSchema);
export default Program;
