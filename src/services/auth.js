import { userStorage, authStorage } from './storage';
import { initializeDefaultData } from './storage';

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password) => {
  // Simple hash for demo - in production use proper hashing
  return btoa(password);
};

const verifyPassword = (password, hash) => {
  return btoa(password) === hash;
};

export const authService = {
  async initialize() {
    await initializeDefaultData();
  },

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await userStorage.getByEmail(email.trim());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password - handle both plain text (for default user) and hashed passwords
    const passwordMatches = 
      user.password === password || 
      verifyPassword(password, user.password) ||
      (user.password && user.password === btoa(password));

    if (!passwordMatches) {
      throw new Error('Invalid email or password');
    }

    // Remove password from user object before storing
    const { password: _, ...userWithoutPassword } = user;
    await authStorage.setCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  },

  async register(email, password, name, role = 'user') {
    const existingUser = await userStorage.getByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = hashPassword(password);
    const user = await userStorage.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role,
    });

    const { password: _, ...userWithoutPassword } = user;
    await authStorage.setCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  },

  async logout() {
    await authStorage.clearCurrentUser();
  },

  async getCurrentUser() {
    return await authStorage.getCurrentUser();
  },

  async updatePassword(userId, newPassword) {
    const hashedPassword = hashPassword(newPassword);
    await userStorage.update(userId, { password: hashedPassword });
  },
};

