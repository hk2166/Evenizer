import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "../models/enum.js";
import { Customer } from "../models/Customer.js";
import { Organizer } from "../models/Organizer.js";
import { db, MockRepository } from "../repositories/mock.repository.js";
import { env } from "../config/env.js";

type AuthSuccess = {
  token: string;
  user: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

type AuthError = {
  error: string;
};

type AuthResponse = AuthSuccess | AuthError;

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = Array.from(db.users.values()).find(
      (u) => u.email === normalizedEmail,
    );

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    if (role === UserRole.CUSTOMER) {
      newUser = new Customer(uuidv4(), name, normalizedEmail, hashedPassword);
    } else if (role === UserRole.ORGANIZER) {
      newUser = new Organizer(uuidv4(), name, normalizedEmail, hashedPassword);
    } else {
      return { error: "Invalid user role" }; // ✅ safety check
    }

    MockRepository.save(db.users, newUser);

    const token = this.generateToken(newUser.id, newUser.email, newUser.role);

    return {
      token,
      user: {
        userId: newUser.id, // Return as userId for consistency
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = Array.from(db.users.values()).find(
      (u) => u.email === normalizedEmail,
    );

    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Invalid email or password" };
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        userId: user.id, // Return as userId for consistency
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  private static generateToken(
    userId: string,
    email: string,
    role: UserRole,
  ): string {
    return jwt.sign({ userId, email, role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as SignOptions);
  }
}
