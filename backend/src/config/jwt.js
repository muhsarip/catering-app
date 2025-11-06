if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in environment variables. Using default (not secure for production)');
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-default-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
