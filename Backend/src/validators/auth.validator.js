import Joi from "joi";


export const registerValidator = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(30)
    .trim()
    .lowercase()
    .required(),

  middleName: Joi.string()
    .min(2)
    .max(30)
    .trim()
    .lowercase()
    .required(),

  lastName: Joi.string()
    .min(2)
    .max(30)
    .trim()
    .lowercase()
    .required(),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be between 10-15 digits"
    }),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please use a valid email address"
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .required(),

  nominee: Joi.object({
    firstName: Joi.string().min(2).max(30).trim().lowercase().required(),
    middleName: Joi.string().allow("", null),
    lastName: Joi.string().min(2).max(30).trim().lowercase().required(),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .allow("", null)
      .messages({
        "string.pattern.base": "Nominee phone must be 10-15 digits"
      }),

    email: Joi.string()
      .email()
      .trim()
      .lowercase()
      .required(),

    relation: Joi.string().min(2).max(30).required()
  }).required()
});


export const loginValidator = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),

  password: Joi.string()
    .required()
});