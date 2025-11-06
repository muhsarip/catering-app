export const paginate = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};
