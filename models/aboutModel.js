import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema({
  aboutImage: {
    url: String,
    public_id: String,
  },
  volunteerImage: [
    {
      url: String,
      public_id: String,
    },
  ],
  AboutContent: {
    heading: String,
    content: String,
  },
  aboutVideo: {
    url: String,
    public_id: String,
  },
  achived: {
    savings: String,
    totalRaised: String,
    communityReached: String,
    targetAchived: String,
  },
}, { timestamps: true });

const About = mongoose.model("About", aboutSchema);
export default About;
