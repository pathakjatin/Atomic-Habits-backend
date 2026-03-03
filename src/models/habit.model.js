import mongoose from "mongoose";
import {HABIT_CATEGORIES} from "../constants/habitCategories"; 
const { Schema } = mongoose;

const habitSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true,
        index: true
    },
    name:{
        type: String,
        required: true,
        trim:true
    },
    description:{
        type: String
    },
    category:{
        type: String,
        enum: HABIT_CATEGORIES,
        required:true,
        index: true
    },
    trackingType:{
        type: String,
        enum:["binary","measurable","duration"],
        required:true
    },
    frequency:{
        type: String,
        enum:["daily","weekly","monthly"],
        default:"daily"
    },
    status:{
        type: String,
        enum:["active","paused","archived"],
        default:"active",
        index: true
    },
    target:{
        label:{type: String},
        value:{type: Number}
    },
    startDate:{
        type: Date,
        required: true
    },
    endDate:{type: Date},
    streak:{
        current:{type: Number, default: 0},
        best:{type: Number, default: 0},
        lastCompletedDate:{type: String}
    },
    badges:[{
        type: String
    }],
},{timestamps: true}
);

habitSchema.index({userId: 1, status: 1});

export default mongoose.model("Habit", habitSchema);
