import mongoose from "mongoose";
// Define schema
const contactMeetSchema = new mongoose.Schema({

  image:
  {
    url: String,
    public_id: String
  }
  ,
  number: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  heading: {
    type: String,
    required: [true, "Heading is required"],
  },
}, { timestamps: true });

// Create model
const ContactMeet = mongoose.model("ContactMeet", contactMeetSchema);
export default ContactMeet