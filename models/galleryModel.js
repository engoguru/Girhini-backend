import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
    galleryImage: [
        {
            url: String,
            public_id: String
        }
    ]

});

const galleryModel = mongoose.model("GalleryData", gallerySchema);
export default galleryModel