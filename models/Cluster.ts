import mongoose from "mongoose";

const ClusterSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  address: [String],
  metadata: {
    type: {
      constructor: String,
      date_created: Date,
      last_modifier: String,
      date_last_modified: Date,
    },
    required: true,
  },
});

export default mongoose.models.Cluster ||
  mongoose.model("Cluster", ClusterSchema);
