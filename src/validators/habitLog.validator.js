// add to habit.validator.js

export const createLogValidator = Joi.object({
  date: Joi.date().required(),
  status: Joi.string().valid("success", "partial", "failed").required(),
  value: Joi.number().min(0).optional(),
  note: Joi.string().max(300).optional(),
});

export const updateLogValidator = Joi.object({
  status: Joi.string().valid("success", "partial", "failed"),
  value: Joi.number().min(0),
  note: Joi.string().max(300),
}).min(1);