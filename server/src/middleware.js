export const requireAuth = (req, res, next) =>
  req.isAuthenticated() ? next() : res.status(401).json({ error: 'Sign in required' });

// Validates and sanitizes req[source] with a Joi schema (trims strings, drops unknown keys).
export const validate = (schema, source = 'body') => (req, res, next) => {
  const { value, error } = schema.validate(req[source], {
    stripUnknown: true,
    abortEarly: false,
    errors: { wrap: { label: false } },
  });
  if (error) return res.status(400).json({ error: error.details.map((d) => d.message).join('. ') });
  req[source] = value;
  next();
};
