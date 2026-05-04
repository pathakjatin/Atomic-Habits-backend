import  User     from "../models/user.model.js";
import  Habit    from "../models/habit.model.js";
import  HabitLog  from "../models/habitLog.model.js";

// ── Totals + KPIs ────────────────────────────────────────────────
export async function aggregateMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const sevenDaysAgo  = new Date(now - 7  * 86400000);

  const [
    totalUsers, totalHabits, totalLogs,
    newUsersLast30d, activeUsersLast30d,
    newHabitsLast30d, logsLast7d,
  ] = await Promise.all([
    User.countDocuments(),
    Habit.countDocuments(),
    HabitLog.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),   // add lastLoginAt to User model
    Habit.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    HabitLog.countDocuments({ date: { $gte: sevenDaysAgo } }),
  ]);

  return {
    totalUsers, totalHabits, totalLogs,
    newUsersLast30d, activeUsersLast30d,
    newHabitsLast30d, logsLast7d,
  };
}

// ── Daily new-user growth ─────────────────────────────────────────
export async function getUserGrowthOverTime(days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  return User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);
}

// ── Daily habit log activity ──────────────────────────────────────
export async function getLogsOverTime(days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  return HabitLog.aggregate([
    { $match: { date: { $gte: since } } },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);
}

// ── Distributions (habit types, themes, badge counts) ────────────
export async function getDistributions() {
  const [habitTypes, targetDirections, badgeDistribution] = await Promise.all([
    Habit.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { label: "$_id", count: 1, _id: 0 } },
    ]),
    Habit.aggregate([
      { $match: { targetDirection: { $exists: true } } },
      { $group: { _id: "$targetDirection", count: { $sum: 1 } } },
      { $project: { label: "$_id", count: 1, _id: 0 } },
    ]),
    // Badge counts — assumes User has earnedBadges: [String]
    User.aggregate([
      { $project: { badgeCount: { $size: { $ifNull: ["$earnedBadges", []] } } } },
      { $group: {
          _id: "$badgeCount",
          users: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
      { $project: { badgesEarned: "$_id", users: 1, _id: 0 } },
    ]),
  ]);

  return { habitTypes, targetDirections, badgeDistribution };
}

export async function getRetentionMetrics() {
  const now = new Date();
  const day7window  = new Date(now - 7  * 86400000);
  const day30window = new Date(now - 30 * 86400000);

  // Users who signed up at least 7 days ago
  const eligibleDay7 = await User.find(
    { createdAt: { $lte: day7window } },
    { _id: 1 }
  ).lean();

  // Users who signed up at least 30 days ago
  const eligibleDay30 = await User.find(
    { createdAt: { $lte: day30window } },
    { _id: 1 }
  ).lean();

  const eligibleDay7Ids  = eligibleDay7.map(u => u._id);
  const eligibleDay30Ids = eligibleDay30.map(u => u._id);

  // Of those, who logged at least once in the 7th day window (day 6–8 around signup)
  const retained7 = await HabitLog.distinct("user", {
    user: { $in: eligibleDay7Ids },
    date: { $gte: day7window },
  });

  const retained30 = await HabitLog.distinct("user", {
    user: { $in: eligibleDay30Ids },
    date: { $gte: day30window },
  });

  // Habits per user
  const habitsPerUser = eligibleDay7Ids.length > 0
    ? await (async () => {
        const [{ avg } = { avg: 0 }] = await Habit.aggregate([
          { $group: { _id: "$user", count: { $sum: 1 } } },
          { $group: { _id: null, avg: { $avg: "$count" } } },
        ]);
        return Math.round(avg * 10) / 10;
      })()
    : 0;

  // Average streak across all active habits
  const [{ avgStreak } = { avgStreak: 0 }] = await Habit.aggregate([
    { $match: { currentStreak: { $gt: 0 } } },
    { $group: { _id: null, avgStreak: { $avg: "$currentStreak" } } },
  ]);

  return {
    day7RetentionPct:  eligibleDay7Ids.length  > 0 ? Math.round((retained7.length  / eligibleDay7Ids.length)  * 100) : 0,
    day30RetentionPct: eligibleDay30Ids.length > 0 ? Math.round((retained30.length / eligibleDay30Ids.length) * 100) : 0,
    eligibleDay7:  eligibleDay7Ids.length,
    eligibleDay30: eligibleDay30Ids.length,
    habitsPerUser,
    avgStreak: Math.round(avgStreak * 10) / 10,
  };
}