import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { conflict, unauthorized, notFound } from '@marketplace/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-dev-only-secret-key-32chars-min';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export async function register({ name, email, password, role }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw conflict('Email is already registered', 'EMAIL_EXISTS', [{ field: 'email', message: 'Email already in use' }]);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role
  });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: user.toJSON()
  };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: user.toJSON()
  };
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw notFound('User not found', 'USER_NOT_FOUND');
  }
  return user.toJSON();
}

export async function getStats() {
  const [totalUsers, customersCount, vendorsCount, adminsCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'vendor' }),
    User.countDocuments({ role: 'admin' })
  ]);

  return {
    totalUsers,
    customersCount,
    vendorsCount,
    adminsCount
  };
}
