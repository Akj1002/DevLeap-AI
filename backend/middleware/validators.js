/**
 * Request Validation Middleware using Joi
 */

const { ValidationError } = require('./errorHandler');

/**
 * Validate request body, params, or query
 * @param {object} schema - Joi schema
 * @param {string} source - 'body', 'params', or 'query'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
        type: d.type,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details,
      });
    }

    // Replace original data with validated and converted data
    req[source] = value;
    next();
  };
};

module.exports = { validate };
