import Habit from "../models/habit.model.js";
import AppError from "../utils/AppError.js";
import { checkFirstHabitBadge } from "./badge.service.js";

export async function createHabit(userId, data) {
  const habit = await Habit.create({ user: userId, ...data });
  await checkFirstHabitBadge(userId);
  return habit;
}

export async function getUserHabits(userId, filters = {}) {
  const query = { user: userId };

  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.frequency) query.frequency = filters.frequency;

  const habits = await Habit.find(query).sort({ createdAt: -1 });
  return habits;
}

export async function getHabitById(userId, habitId) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) {
    throw new AppError("HABIT_NOT_FOUND", "Habit not found", 404);
  }
  return habit;
}

export async function updateHabit(userId, habitId, data) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) {
    throw new AppError("HABIT_NOT_FOUND", "Habit not found", 404);
  }

  // Prevent trackingType mutation — data integrity rule
  if (data.trackingType) {
    throw new AppError(
      "INVALID_UPDATE",
      "Tracking type cannot be changed after creation",
      400
    );
  }

  Object.assign(habit, data);
  await habit.save();
  return habit;
}

export async function deleteHabit(userId, habitId) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) {
    throw new AppError("HABIT_NOT_FOUND", "Habit not found", 404);
  }

  await habit.deleteOne();
  return { id: habitId };
}