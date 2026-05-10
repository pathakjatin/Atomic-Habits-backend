import Habit from "../models/habit.model.js";
import HabitLog from "../models/habitLog.model.js";
import { toDateString } from "../utils/date.utils.js";

function getPeriodRange(period) {
  const end = new Date();
  const endUTC = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  const daysMap = { weekly: 6, monthly: 29, quarterly: 89 };
  const days = daysMap[period];
  if (days === undefined) return null;

  const startUTC = new Date(endUTC);
  startUTC.setUTCDate(startUTC.getUTCDate() - days);

  return { start: startUTC, end: endUTC };
}

function computePeakStreak(sortedLogs) {
  // sortedLogs: logs for ONE habit, sorted by date asc, already period-filtered
  let current = 0;
  let peak = 0;
  let lastDate = null;

  for (const log of sortedLogs) {
    if (log.status === "failed") {
      current = 0;
      lastDate = null;
      continue;
    }

    // partial = keep chain alive, don't increment
    const logStr = toDateString(log.date);

    if (!lastDate) {
      current = log.status === "success" ? 1 : 0;
    } else {
      const prev = new Date(log.date);
      prev.setUTCDate(prev.getUTCDate() - 1);
      const prevStr = toDateString(prev);

      if (toDateString(lastDate) === prevStr) {
        if (log.status === "success") current += 1;
        // partial: no increment, chain stays alive
      } else {
        current = log.status === "success" ? 1 : 0;
      }
    }

    lastDate = log.date;
    if (current > peak) peak = current;
  }

  return peak;
}

export async function getReport(userId, period) {
  const range = getPeriodRange(period);
  if (!range) return null;

  const { start, end } = range;

  // Fetch all active habits for user
  const habits = await Habit.find({ user: userId, status: "active" }).lean();
  if (habits.length === 0) return buildEmptyReport(period, range, []);

  // Fetch all logs in period
  const logs = await HabitLog.find({
    user: userId,
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  // Group logs by habitId
  const logsByHabit = {};
  for (const log of logs) {
    const key = log.habit.toString();
    if (!logsByHabit[key]) logsByHabit[key] = [];
    logsByHabit[key].push(log);
  }

  // Per-habit stats
  const habitStats = habits.map((habit) => {
    const habitLogs = logsByHabit[habit._id.toString()] || [];
    const total = habitLogs.length;
    const successCount = habitLogs.filter((l) => l.status === "success").length;
    const partialCount = habitLogs.filter((l) => l.status === "partial").length;
    const failedCount = habitLogs.filter((l) => l.status === "failed").length;

    // partial counts as 0 toward completion rate
    const completionRate = total === 0 ? 0 : Math.round((successCount / total) * 100);
    const peakStreak = computePeakStreak(habitLogs);

    return {
      habitId: habit._id,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      completionRate,
      peakStreak,
      breakdown: { success: successCount, partial: partialCount, failed: failedCount },
      totalLogged: total,
    };
  });

  // Sort by completionRate for ranking
  const ranked = [...habitStats].sort((a, b) => b.completionRate - a.completionRate);
  ranked.forEach((h, i) => (h.rank = i + 1));

  // Overall stats
  const totalLogged = logs.length;
  const totalSuccess = logs.filter((l) => l.status === "success").length;
  const totalPartial = logs.filter((l) => l.status === "partial").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;
  const overallCompletionRate =
    totalLogged === 0 ? 0 : Math.round((totalSuccess / totalLogged) * 100);

  // Daily heatmap
  const heatmapMap = {};
  for (const log of logs) {
    const dateStr = toDateString(log.date);
    if (!heatmapMap[dateStr]) heatmapMap[dateStr] = { date: dateStr, successCount: 0, totalLogged: 0 };
    heatmapMap[dateStr].totalLogged += 1;
    if (log.status === "success") heatmapMap[dateStr].successCount += 1;
  }
  const heatmap = Object.values(heatmapMap).sort((a, b) => a.date.localeCompare(b.date));

  // Best / worst (only habits with at least 1 log)
  const loggedHabits = ranked.filter((h) => h.totalLogged > 0);
  const bestHabit = loggedHabits[0] ?? null;
  const worstHabit = loggedHabits[loggedHabits.length - 1] ?? null;

  return {
    period,
    range: { start: toDateString(start), end: toDateString(end) },
    overall: {
      completionRate: overallCompletionRate,
      totalLogged,
      successCount: totalSuccess,
      partialCount: totalPartial,
      failedCount: totalFailed,
    },
    habits: ranked,
    heatmap,
    bestHabit: bestHabit
      ? { habitId: bestHabit.habitId, name: bestHabit.name, completionRate: bestHabit.completionRate }
      : null,
    worstHabit: worstHabit
      ? { habitId: worstHabit.habitId, name: worstHabit.name, completionRate: worstHabit.completionRate }
      : null,
  };
}

function buildEmptyReport(period, range, habits) {
  return {
    period,
    range: { start: toDateString(range.start), end: toDateString(range.end) },
    overall: { completionRate: 0, totalLogged: 0, successCount: 0, partialCount: 0, failedCount: 0 },
    habits: [],
    heatmap: [],
    bestHabit: null,
    worstHabit: null,
  };
}