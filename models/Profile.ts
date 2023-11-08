import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  target: {
    type: String,
    require: true,
  },
  flags: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
  ],
  entities: [String],
  comment: {
    type: String,
  },
});

export default mongoose.models.Profile ||
  mongoose.model("Profile", ProfileSchema);
