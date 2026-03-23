// src/controllers/habit.controller.js
import {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
} from "../services/habit.service.js";
import {
  createHabitValidator,
  updateHabitValidator,
} from "../validators/habit.validator.js";

export async function create(req, res) {
  try {
    const { error } = createHabitValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const habit = await createHabit(req.user._id, req.body);
    return res.status(201).json({ message: "Habit created successfully", data: habit });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAll(req, res) {
  try {
    const { status, category, frequency } = req.query;
    const habits = await getUserHabits(req.user._id, { status, category, frequency });
    return res.status(200).json({ message: "Habits fetched successfully", data: habits });
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
    const habit = await getHabitById(req.user._id, req.params.id);
    return res.status(200).json({ message: "Habit fetched successfully", data: habit });
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
    const { error } = updateHabitValidator.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const habit = await updateHabit(req.user._id, req.params.id, req.body);
    return res.status(200).json({ message: "Habit updated successfully", data: habit });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const result = await deleteHabit(req.user._id, req.params.id);
    return res.status(200).json({ message: "Habit deleted successfully", data: result });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}