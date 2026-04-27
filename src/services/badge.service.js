// src/services/badge.service.js
import UserBadge from "../models/userBadge.model.js";
import HabitLog from "../models/habitLog.model.js";
import Habit from "../models/habit.model.js";
import { BADGE_DEFINITIONS } from "../constants/badgeDefinitions.js";
import { toDateString } from "../utils/date.utils.js";
import { calculateSuccessRatio } from "../utils/ratio.utils.js";

// ─── Core Award Function ─────────────────────────────────

async function awardIfNotEarned(userId, key) {
  try {
    await UserBadge.create({ user: userId, key });
  } catch (err) {
    // 11000 = duplicate key — badge already earned, silently ignore
    if (err.code !== 11000) throw err;
  }
}

// ─── Individual Checkers ─────────────────────────────────

async function checkStreakBadges(userId, currentStreak) {
  const milestones = [
    { threshold: 7, key: "STREAK_7" },
    { threshold: 30, key: "STREAK_30" },
    { threshold: 100, key: "STREAK_100" },
  ];

  for (const { threshold, key } of milestones) {
    if (currentStreak >= threshold) {
      await awardIfNotEarned(userId, key);
    }
  }
}

async function checkTotalBadges(userId) {
  const total = await HabitLog.countDocuments({
    user: userId,
    status: "success",
  });

  const milestones = [
    { threshold: 10, key: "TOTAL_10" },
    { threshold: 50, key: "TOTAL_50" },
    { threshold: 100, key: "TOTAL_100" },
  ];

  for (const { threshold, key } of milestones) {
    if (total >= threshold) {
      await awardIfNotEarned(userId, key);
    }
  }
}

async function checkPerfectWeek(userId) {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);

  const habits = await Habit.find({ user: userId, status: "active" });
  if (habits.length === 0) return;

  // For each habit, check all 7 days it was due have a success log
  for (const habit of habits) {
    const dueDates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      // Only include days on or after habit startDate
      if (d < new Date(toDateString(new Date(habit.startDate)))) continue;
      if (isDueOnDate(habit, d)) dueDates.push(new Date(toDateString(d)));
    }

    if (dueDates.length === 0) continue;

    const logs = await HabitLog.find({
      habit: habit._id,
      user: userId,
      date: { $in: dueDates },
      status: "success",
    });

    // All due dates must have a success log
    if (logs.length < dueDates.length) return;
  }

  await awardIfNotEarned(userId, "PERFECT_WEEK");
}

async function checkConsistencyBadges(userId) {
  const allLogs = await HabitLog.find({ user: userId });
  if (allLogs.length < 10) return; // minimum threshold

  const successCount = allLogs.filter((l) => l.status === "success").length;
  const ratio = calculateSuccessRatio(successCount, allLogs.length);

  if (ratio >= 80) await awardIfNotEarned(userId, "CONSISTENCY_80");
  if (ratio >= 50) await awardIfNotEarned(userId, "CONSISTENCY_50");
}

// ─── Helper ──────────────────────────────────────────────

function isDueOnDate(habit, date) {
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly") return date.getUTCDay() === habit.dueDay;
  if (habit.frequency === "monthly") return date.getUTCDate() === habit.dueDay;
  return false;
}

// ─── Main Evaluator ──────────────────────────────────────

export async function evaluateBadges(userId, context = {}) {
  const checks = [
    checkTotalBadges(userId),
    checkConsistencyBadges(userId),
    checkPerfectWeek(userId),
  ];

  if (context.currentStreak !== undefined) {
    checks.push(checkStreakBadges(userId, context.currentStreak));
  }

  await Promise.all(checks);
}

// ─── First Habit Badge ────────────────────────────────────

export async function checkFirstHabitBadge(userId) {
  const count = await Habit.countDocuments({ user: userId });
  if (count === 1) {
    await awardIfNotEarned(userId, "FIRST_HABIT");
  }
}

// ─── Get User Badges ─────────────────────────────────────

export async function getUserBadges(userId) {
  const earned = await UserBadge.find({ user: userId }).sort({ earnedAt: -1 });

  const earnedKeys = new Set(earned.map((b) => b.key));

  // Return all badge definitions with earned status
  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    earned: earnedKeys.has(def.key),
    earnedAt: earned.find((b) => b.key === def.key)?.earnedAt ?? null,
  }));
}