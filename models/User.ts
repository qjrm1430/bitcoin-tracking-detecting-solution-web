import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  tab: {
    type: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
      },
    ],
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
