import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - adjust regex based on your requirements
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const sanitizeInput = (input: string): string => {
  return validator.escape(input.trim());
};

export const validateOrderStatus = (status: string): boolean => {
  const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Delivered', 'Cancelled'];
  return validStatuses.includes(status);
};

export const validatePaymentMethod = (method: string): boolean => {
  const validMethods = ['Cash', 'Transfer', 'Credit Card'];
  return validMethods.includes(method);
};

export const validatePaymentStatus = (status: string): boolean => {
  const validStatuses = ['Pending', 'Paid', 'Partial'];
  return validStatuses.includes(status);
};

export const validateStatusTransition = (oldStatus: string, newStatus: string): boolean => {
  // Orders can be cancelled from any status except Delivered
  if (newStatus === 'Cancelled' && oldStatus !== 'Delivered') {
    return true;
  }

  // Forward progression only
  const statusOrder = ['Pending', 'Confirmed', 'In Progress', 'Delivered'];
  const oldIndex = statusOrder.indexOf(oldStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  if (oldIndex === -1 || newIndex === -1) {
    return false;
  }

  // Can only move forward in the sequence
  return newIndex > oldIndex;
};
