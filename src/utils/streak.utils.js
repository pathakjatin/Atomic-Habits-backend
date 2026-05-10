import { toDateString, getYesterday } from "./date.utils.js";

export function calculateStreak({ lastCompletedDate, currentStreak, today }) {
  const todayStr = toDateString(today);

  if (!lastCompletedDate) return 1;

  const lastStr = toDateString(lastCompletedDate); // normalize regardless of input type

  if (lastStr === todayStr) return currentStreak;         // already counted today
  if (lastStr === getYesterday(today)) return currentStreak + 1; // consecutive
  return 1;                                               // gap — reset
}

// streak.utils.js
export async function recomputeStreak(habit) {
  const logs = await HabitLog.find({ habit: habit._id })
    .sort({ date: 1 })
    .select("date status");

  let current = 0;
  let best = 0;
  let lastSuccessDate = null;

  for (const log of logs) {
    if (log.status === "success" || log.status === "partial") {
      const logStr = toDateString(log.date);

      if (!lastSuccessDate) {
        current = log.status === "success" ? 1 : 0;
      } else {
        const yesterday = getYesterday(log.date);
        const lastStr = toDateString(lastSuccessDate);

        if (lastStr === yesterday) {
          // consecutive day
          if (log.status === "success") current += 1;
          // partial: keep current alive, don't increment
        } else {
          // gap — reset
          current = log.status === "success" ? 1 : 0;
        }
      }

      lastSuccessDate = log.date;
      if (current > best) best = current;

    } else {
      // failed — break the chain
      current = 0;
      lastSuccessDate = null;
    }
  }

  habit.streak.current = current;
  habit.streak.best = best;
  habit.streak.lastCompletedDate = lastSuccessDate ?? habit.streak.lastCompletedDate;
  await habit.save();
}