// Success response
export const successResponse = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

// Error response
export const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    error: message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Paginated response
export const paginatedResponse = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination
  });
};
