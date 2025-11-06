export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      error: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
