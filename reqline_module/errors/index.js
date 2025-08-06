// A simple custom error handler. I prefer as much loose coupling as possible.
exports.errorResponse = (res, statuscode, message) =>
  res.status(statuscode).json({ error: true, message });
