const Joi = require('joi');

// Reusable request validation middleware with safe JSON parsing
module.exports = function validate(schema) {
  return (req, res, next) => {
    let data = ['GET', 'DELETE'].includes(req.method) ? req.query : req.body;

    // If body came in as a raw string (e.g., wrong/missing Content-Type), try to parse
    if (!['GET', 'DELETE'].includes(req.method) && typeof data === 'string') {
      try { data = JSON.parse(data); } catch (_) {}
    }

    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: error.details.map(d => ({ message: d.message, path: d.path }))
      });
    }
    if (['GET', 'DELETE'].includes(req.method)) req.query = value; else req.body = value;
    next();
  };
};