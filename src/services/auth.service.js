import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export async function registerUser(payload) {
    const { name, email, picture, phone, username, password, dob, gender } = payload;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new AppError("USER_ALREADY_EXISTS", "Email or username is already taken", 409);
    }

    const user = await User.create({ name, email, picture, phone, username, password, dob, gender });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
    };
}

export async function loginUser(payload) {
    const { username, password } = payload;

    const existingUser = await User.findOne({ username }).select("+password");
    if (!existingUser) {
        throw new AppError("INVALID_CREDENTIALS", "Invalid username or password", 401);
    }

    const isMatch = await existingUser.matchPassword(password);
    if (!isMatch) {
        throw new AppError("INVALID_CREDENTIALS", "Invalid username or password", 401);
    }

    return {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
    };
}