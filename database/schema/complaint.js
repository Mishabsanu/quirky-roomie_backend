import mongoose, { Schema } from "mongoose";

const complaintSchema = new Schema({
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, required: true },
  type: { type: String, trim: true, required: true },
  severity: { type: String, trim: true, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  flatCode: { type: String, trim: true, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  punishment: {
    type: String,
    default: null,
  },
  isResolved: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

const ComplaintModel = mongoose.model("Complaint", complaintSchema);

export default ComplaintModel;
