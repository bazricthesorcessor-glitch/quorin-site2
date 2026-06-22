import crypto from 'crypto';

export const hashPassword = (password: string): string => {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
