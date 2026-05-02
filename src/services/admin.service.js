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