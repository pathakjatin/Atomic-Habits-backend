import HabitLog from "../models/habitLog.model.js";
import Habit from "../models/habit.model.js";
import AppError from "../utils/AppError.js";
import { toDateString } from "../utils/date.utils.js";
import { calculateStreak } from "../utils/streak.utils.js";
import { evaluateBadges } from "./badge.service.js";

async function updateStreak(habit, logDate, status) {
  if (status === "failed") {
    habit.streak.current = 0;
    await habit.save();
    return;
  }

  if (status === "partial") {
    await habit.save();
    return;
  }

  // status === "success"
  const newStreak = calculateStreak({
    lastCompletedDate: habit.streak.lastCompletedDate,
    currentStreak: habit.streak.current,
    today: logDate,
  });

  habit.streak.current = newStreak;
  if (newStreak > habit.streak.best) {
    habit.streak.best = newStreak;
  }
  habit.streak.lastCompletedDate = new Date(logDate);
  await habit.save();
}

export async function logHabit(userId, habitId, data) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) {
    throw new AppError("HABIT_NOT_FOUND", "Habit not found", 404);
  }

  if (habit.status !== "active") {
    throw new AppError("HABIT_NOT_ACTIVE", "Only active habits can be logged", 400);
  }

  const logDate = toDateString(data.date);

  let log;
  try {
    log = await HabitLog.create({
      user: userId,
      habit: habitId,
      date: new Date(logDate),
      status: data.status,
      value: data.value ?? 0,
      note: data.note,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("ALREADY_LOGGED", "Habit already logged for this date", 409);
    }
    throw err;
  }

  await updateStreak(habit, logDate, data.status);
  await updateStreak(habit, logDate, data.status);
  await evaluateBadges(userId, { currentStreak: habit.streak.current });
  return log;
}

export async function updateLog(userId, logId, data) {
  const log = await HabitLog.findOne({ _id: logId, user: userId }).populate("habit");
  if (!log) {
    throw new AppError("LOG_NOT_FOUND", "Log not found", 404);
  }

  const previousStatus = log.status;
  log.status = data.status ?? log.status;
  log.value = data.value ?? log.value;
  log.note = data.note ?? log.note;
  await log.save();

  if (data.status && data.status !== previousStatus) {
    await updateStreak(log.habit, log.date, data.status);
  }

  return log;
}

export async function getLogsForHabit(userId, habitId, filters = {}) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) {
    throw new AppError("HABIT_NOT_FOUND", "Habit not found", 404);
  }

  const query = { habit: habitId, user: userId };

  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(toDateString(filters.from));
    if (filters.to) query.date.$lte = new Date(toDateString(filters.to));
  }

  if (filters.status) query.status = filters.status;

  return await HabitLog.find(query).sort({ date: -1 });
}

export async function getLogById(userId, logId) {
  const log = await HabitLog.findOne({ _id: logId, user: userId });
  if (!log) {
    throw new AppError("LOG_NOT_FOUND", "Log not found", 404);
  }
  return log;
}