import { toDateString, getYesterday } from "./date.utils.js";

export function calculateStreak({ lastCompletedDate, currentStreak, today }) {
  const todayStr = toDateString(today);

  if (!lastCompletedDate) return 1;

  const lastStr = toDateString(lastCompletedDate); // normalize regardless of input type

  if (lastStr === todayStr) return currentStreak;         // already counted today
  if (lastStr === getYesterday(today)) return currentStreak + 1; // consecutive
  return 1;                                               // gap — reset
}