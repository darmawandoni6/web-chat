export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'fallback_secret_key';
};
