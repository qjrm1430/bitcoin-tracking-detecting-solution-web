import mongoose from "mongoose";

const CustomClusterSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  user: {
    type: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    required: true,
  },
  member: [String],
  metadata: {
    type: {
      constructor: String,
      date_created: Date,
      last_modifier: String,
      date_last_modified: Date,
    },
    require: true,
  },
});

export default mongoose.models.CustomCluster ||
  mongoose.model("CustomCluster", CustomClusterSchema);
