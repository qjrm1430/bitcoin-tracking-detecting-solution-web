import mongoose from "mongoose";

const FlagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.models.Flag || mongoose.model("Flag", FlagSchema);
