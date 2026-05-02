// src/controllers/dashboard.controller.js
import {
  getTodayHabits,
  getCalendarDay,
  getHabitSummaries,
} from "../services/dashboard.service.js";

export async function today(req, res, next) {
  try {
    const data = await getTodayHabits(req.user._id);
    return res.status(200).json({ message: "Today's habits fetched", data });
  } catch (error) {
    next(error);
  }
}

export async function calendarDay(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query param is required" });
    }
    const data = await getCalendarDay(req.user._id, date);
    return res.status(200).json({ message: "Calendar day fetched", data });
  } catch (error) {
    next(error);
  }
}

export async function summaries(req, res, next) {
  try {
    const data = await getHabitSummaries(req.user._id);
    return res.status(200).json({ message: "Habit summaries fetched", data });
  } catch (error) {
    next(error);
  }
}