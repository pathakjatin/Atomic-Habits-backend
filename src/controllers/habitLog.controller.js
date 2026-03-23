// src/controllers/habitLog.controller.js
import {
  logHabit,
  updateLog,
  getLogsForHabit,
  getLogById,
} from "../services/habitLog.service.js";
import {
  createLogValidator,
  updateLogValidator,
} from "../validators/habit.validator.js";

export async function create(req, res) {
  try {
    const { error } = createLogValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const log = await logHabit(req.user._id, req.params.habitId, req.body);
    return res.status(201).json({ message: "Habit logged successfully", data: log });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const { error } = updateLogValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const log = await updateLog(req.user._id, req.params.logId, req.body);
    return res.status(200).json({ message: "Log updated successfully", data: log });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getForHabit(req, res) {
  try {
    const { from, to, status } = req.query;
    const logs = await getLogsForHabit(req.user._id, req.params.habitId, {
      from,
      to,
      status,
    });
    return res.status(200).json({ message: "Logs fetched successfully", data: logs });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getOne(req, res) {
  try {
    const log = await getLogById(req.user._id, req.params.logId);
    return res.status(200).json({ message: "Log fetched successfully", data: log });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}