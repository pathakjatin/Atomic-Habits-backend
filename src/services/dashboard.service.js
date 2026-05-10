import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import { toDateString } from "../utils/date.utils.js";
import { calculateSuccessRatio } from "../utils/ratio.utils.js";

// ─── Helpers ────────────────────────────────────────────

function isDueToday(habit, date) {
  const d = new Date(date);

  // Respect startDate and endDate for all frequencies
  if (habit.startDate && d < new Date(habit.startDate)) return false;
  if (habit.endDate && d > new Date(habit.endDate)) return false;

  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly") return d.getUTCDay() === habit.dueDay;
  if (habit.frequency === "monthly") return d.getUTCDate() === habit.dueDay;
  return false;
}
function buildLogMap(logs) {
  const map = {};
  for (const log of logs) {
    map[log.habit.toString()] = log;
  }
  return map;
}

// ─── Today's Habits ─────────────────────────────────────

export async function getTodayHabits(userId) {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayStr = toDateString(now);

  const habits = await Habit.find({ user: userId, status: "active" });
  const dueHabits = habits.filter((h) => isDueToday(h, todayUTC));

  if (dueHabits.length === 0) return [];

  const logs = await HabitLog.find({
    user: userId,
    habit: { $in: dueHabits.map((h) => h._id) },
    date: todayUTC,
  });
  const logMap = buildLogMap(logs);

  return dueHabits.map((habit) => {
    const log = logMap[habit._id.toString()];
    return {
      habit: {
        _id: habit._id,
        name: habit.name,
        category: habit.category,
        trackingType: habit.trackingType,
        target: habit.target,
        frequency: habit.frequency,
      },
      log: log
        ? { _id: log._id, status: log.status, value: log.value, note: log.note }
        : null,
      isLogged: !!log,
    };
  });
}

// ─── Calendar Day Habits ─────────────────────────────────

export async function getCalendarDay(userId, dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);

  // Logs are stored as UTC midnight — query must match exactly
  const normalizedDate = new Date(Date.UTC(year, month - 1, day));

  const todayUTC = new Date();
  const todayNormalized = new Date(Date.UTC(
    todayUTC.getUTCFullYear(),
    todayUTC.getUTCMonth(),
    todayUTC.getUTCDate()
  ));

  const isFuture = normalizedDate > todayNormalized;

  // isDueToday needs a date where getDay()/getDate() reflect the correct calendar day
  // Use UTC methods since date is UTC midnight
  const date = normalizedDate;

  const habits = await Habit.find({ user: userId, status: "active" });
  const dueHabits = habits.filter((h) => isDueToday(h, date));

  if (dueHabits.length === 0) return [];

  let logMap = {};
  if (!isFuture) {
    const logs = await HabitLog.find({
      user: userId,
      habit: { $in: dueHabits.map((h) => h._id) },
      date: normalizedDate,
    });
    logMap = buildLogMap(logs);
  }

  return dueHabits.map((habit) => {
    const log = logMap[habit._id.toString()];
    return {
      habit: {
        _id: habit._id,
        name: habit.name,
        category: habit.category,
        frequency: habit.frequency,
      },
      log: log ? { _id: log._id, status: log.status, value: log.value } : null,
      isLogged: !!log,
      isLocked: isFuture,
    };
  });
}

// ─── Habit Summary Cards ─────────────────────────────────

export async function getHabitSummaries(userId) {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6); // today + 6 days back = 7 days

  const habits = await Habit.find({ user: userId, status: "active" });
  if (habits.length === 0) return [];

  // Fetch 7-day logs for all habits in one query
  const recentLogs = await HabitLog.find({
    user: userId,
    habit: { $in: habits.map((h) => h._id) },
    date: { $gte: new Date(toDateString(sevenDaysAgo)) },
  });

  // Fetch all-time logs per habit for success %
  const allLogs = await HabitLog.find({
    user: userId,
    habit: { $in: habits.map((h) => h._id) },
  });

  // Group logs by habitId
  function groupByHabit(logs) {
    return logs.reduce((acc, log) => {
      const key = log.habit.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    }, {});
  }

  const recentByHabit = groupByHabit(recentLogs);
  const allByHabit = groupByHabit(allLogs);

  return habits.map((habit) => {
    const id = habit._id.toString();
    const recent = recentByHabit[id] || [];
    const all = allByHabit[id] || [];

    // Build 7-day progress — one entry per day
    const sevenDayProgress = [];
    for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const dStr = toDateString(d);

    // Skip days before habit started
    if (new Date(dStr) < new Date(toDateString(new Date(habit.startDate)))) {
        continue;
    }

    const log = recent.find((l) => toDateString(l.date) === dStr);
    sevenDayProgress.push({
        date: dStr,
        status: log ? log.status : "not_logged",
    });
    }

    // Success % since startDate
    const totalLogs = all.length;
    const successLogs = all.filter((l) => l.status === "success").length;
    const successRatio = calculateSuccessRatio(successLogs, totalLogs);

    return {
      _id: habit._id,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      streak: habit.streak,
      successRatio,
      sevenDayProgress,
    };
  });
}