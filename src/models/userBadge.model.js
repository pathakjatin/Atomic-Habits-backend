// src/models/userBadge.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const userBadgeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Prevent earning the same badge twice
userBadgeSchema.index({ user: 1, key: 1 }, { unique: true });

export default mongoose.model("UserBadge", userBadgeSchema);