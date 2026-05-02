import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";

export async function registerUser(payload) {
    const { name, email, picture, phone, username, password, dob, gender } = payload;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new AppError("USER_ALREADY_EXISTS", "Email or username is already taken", 409);
    }

    const user = await User.create({ name, email, picture, phone, username, password, dob, gender });

    return {
        _id: user._id,
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
    existingUser.lastLoginAt = new Date();
    await existingUser.save();

    return {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
    };
}

export async function updateProfile(userId, data) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  return user;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError("INVALID_PASSWORD", "Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save(); // triggers pre("save") hash
}

export async function deleteAccount(userId, password) {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found", 404);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("INVALID_PASSWORD", "Incorrect password", 401);
  }

  // Hard delete — cascade all user data
  await Promise.all([
    HabitLog.deleteMany({ user: userId }),
    Habit.deleteMany({ user: userId }),
    User.findByIdAndDelete(userId),
  ]);
}