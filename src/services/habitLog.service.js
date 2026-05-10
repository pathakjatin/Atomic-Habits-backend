import HabitLog from "../models/habitLog.model.js";
import Habit from "../models/habit.model.js";
import AppError from "../utils/AppError.js";
import { toDateString } from "../utils/date.utils.js";
import { calculateStreak, recomputeStreak } from "../utils/streak.utils.js";
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
  if (!habit) throw new AppError("HABIT_NOT_FOUND", "Habit not found", 404);
  if (habit.status !== "active") throw new AppError("HABIT_NOT_ACTIVE", "Only active habits can be logged", 400);

  // Parse date string safely as local — "2025-05-03" must not go through new Date("2025-05-03")
  const [y, m, d] = (data.date ?? toDateString(new Date())).split("-").map(Number);
  const logDateLocal = new Date(Date.UTC(y, m - 1, d)); // UTC midnight to match stored logs
  const logDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const existingLog = await HabitLog.findOne({
    user: userId,
    habit: habitId,
    date: logDateLocal, // query with the same local midnight Date object
  });

  let log;

  if (existingLog) {
    const betterStatus = (a, b) => {
      const rank = { success: 3, partial: 2, failed: 1 };
      return rank[a] >= rank[b] ? a : b;
    };
    existingLog.value  = (existingLog.value ?? 0) + (data.value ?? 0);
    existingLog.status = data.status;
    if (data.note) existingLog.note = data.note;
    log = await existingLog.save();
  } else {
    log = await HabitLog.create({
      user: userId,
      habit: habitId,
      date: logDateLocal, // save with local midnight
      status: data.status,
      value: data.value ?? 0,
      note: data.note,
    });
  }

  await updateStreak(habit, logDate, log.status);
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

  // in updateLog, replace the streak block at the bottom
if (data.status && data.status !== previousStatus) {
  await recomputeStreak(log.habit);
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