// src/validators/habit.validator.js
import Joi from "joi";
import { HABIT_CATEGORIES } from "../constants/habitCategories.js";

export const createHabitValidator = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  category: Joi.string().valid(...HABIT_CATEGORIES).required(),
  trackingType: Joi.string().valid("binary", "measurable", "duration").required(),
  frequency: Joi.string().valid("daily", "weekly", "monthly").default("daily"),
  target: Joi.when("trackingType", {
    is: Joi.valid("measurable", "duration"),
    then: Joi.object({
      label: Joi.string().required(),
      value: Joi.number().positive().required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).optional(),
  dueDay: Joi.when("frequency", {
  is: "daily",
  then: Joi.forbidden(),
  otherwise: Joi.when("frequency", {
    is: "weekly",
    then: Joi.number().integer().min(0).max(6).required(),
    otherwise: Joi.number().integer().min(1).max(31).required(), // monthly
  }),
}),
});

export const updateHabitValidator = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500),
  category: Joi.string().valid(...HABIT_CATEGORIES),
  frequency: Joi.string().valid("daily", "weekly", "monthly"),
  status: Joi.string().valid("active", "paused", "archived"),
  target: Joi.object({
    label: Joi.string(),
    value: Joi.number().positive(),
  }),
  endDate: Joi.date().optional(),
  dueDay: Joi.number().integer().min(0).max(31).optional(),
}).min(1); // at least one field required on update

