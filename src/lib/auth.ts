import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbUsers, initDB } from './db';
import { User, AuthResponse, JWTPayload } from '../types/auth';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async initialize() {
    await initDB();
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Register new user
  static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate input
      if (!name.trim()) {
        return { success: false, message: 'Name is required' };
      }

      if (!email.trim() || !email.includes('@')) {
        return { success: false, message: 'Valid email is required' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      // Check if user already exists
      const existingUser = await dbUsers.findByEmail(email.toLowerCase());
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Hash password and create user
      const passwordHash = await this.hashPassword(password);
      const userData = await dbUsers.create(name.trim(), email.toLowerCase(), passwordHash);

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      };

      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token,
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate input
      if (!email.trim() || !password.trim()) {
        return { success: false, message: 'Email and password are required' };
      }

      // Find user
      const userData = await dbUsers.findByEmail(email.toLowerCase());
      if (!userData) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, userData.password_hash);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid email or password' };
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      };

      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  // Verify user token and get user data
  static async verifyUser(token: string): Promise<User | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) {
        return null;
      }

      const userData = await dbUsers.findById(payload.userId);
      if (!userData) {
        return null;
      }

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

// Note: TokenStorage moved to ../lib/tokenStorage.ts to avoid importing server-side dependencies in client code