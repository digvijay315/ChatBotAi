export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map(d => d.message);
      // Return the first validation message as standard error string
      return res.status(400).json({ 
        error: errorMessages[0], 
        details: errorMessages 
      });
    }
    next();
  };
};
