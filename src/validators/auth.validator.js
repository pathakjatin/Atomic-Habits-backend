import Joi from "joi";

export const registerValidator = Joi.object({
    name:Joi.string().min(2).max(50).required(),
    email:Joi.string().email().required(),
    username:Joi.string().alphanum().min(3).max(30).required(),
    password:Joi.string()
                .min(8)
                .pattern(/[A-Z]/)
                .pattern(/[0-9]/)
                .required(),
    picture:Joi.string().uri().optional(),
    phone:Joi.string().optional(),
    dob:Joi.date().optional(),
    gender:Joi.string().valid("Male","Female","Other","Preferred not to say").optional()
});