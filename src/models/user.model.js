import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

const userSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    picture:{
        type: String
    },
    phone:{
        type: String,
        trim: true
    },
    username:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    dob:{
        type: Date
    },
    gender:{
        type: String,
        enum:["Male", "Female", "Other", "Preferred not to say"]
    },
    lastLoginAt: { type: Date },
}, {timestamps: true});

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);