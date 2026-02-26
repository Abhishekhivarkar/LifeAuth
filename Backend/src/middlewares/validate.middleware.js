import Joi from "joi";

export const validate = (schema) => {
  return (req, res, next) => {

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(err => ({
          field: err.path.join("."),
          message: err.message
        }))
      });
    }

    req.body = value
    next();
  };
};