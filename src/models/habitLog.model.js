// habitLog.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const habitLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  habit: {
    type: Schema.Types.ObjectId,
    ref: "Habit",
    required: true,
    index: true,
  },
  targetDirection: {
    type: String,
    enum: ["gte", "lte"],
    default: "gte",
  },
  date: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ["success", "partial", "failed"],
  },
  note: {
    type: String,
    maxlength: 300,
  },
}, { timestamps: true });

habitLogSchema.index({ habit: 1, date: 1 }, { unique: true });
habitLogSchema.index({ user: 1, date: 1 });

export default mongoose.model("HabitLog", habitLogSchema);