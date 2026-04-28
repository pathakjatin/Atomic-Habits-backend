// habit.model.js
import mongoose from "mongoose";
import { HABIT_CATEGORIES } from "../constants/habitCategories.js";
const { Schema } = mongoose;

const habitSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: HABIT_CATEGORIES,
    required: true,
    index: true,
  },
  trackingType: {
    type: String,
    enum: ["binary", "measurable", "duration"],
    required: true,
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "daily",
  },
  status: {
    type: String,
    enum: ["active", "paused", "archived"],
    default: "active",
    index: true,
  },
  target: {
    label: { type: String },
    value: { type: Number },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: { type: Date },
  targetDirection: {
    type: String,
    enum: ["gte", "lte"],
    default: "gte",
  },
  streak: {
    current: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    lastCompletedDate: { type: Date },
  },
  badges: [{ type: String }],
  dueDay: {
    type: Number,
    min: 0,
    max: 31,
  },
}, { timestamps: true });

habitSchema.index({ user: 1, status: 1 });

export default mongoose.model("Habit", habitSchema);