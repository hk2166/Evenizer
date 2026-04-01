import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "../models/enum.js";
import { Customer } from "../models/Customer.js";
import { Organizer } from "../models/Organizer.js";
import { db, MockRepository } from "../repositories/mock.repository.js";
import { env } from "../config/env.js";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ token: string; user: any } | { error: string }> {
    const existingUser = Array.from(db.users.values()).find(
      (u) => u.email === email
    );

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = role === UserRole.CUSTOMER
      ? new Customer(uuidv4(), name, email, hashedPassword)
      : new Organizer(uuidv4(), name, email, hashedPassword);

    MockRepository.save(db.users, newUser);

    const token = this.generateToken(newUser.id, newUser.email, newUser.role);

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: any } | { error: string }> {
    const user = Array.from(db.users.values()).find(
      (u) => u.email === email
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  private static generateToken(
    userId: string,
    email: string,
    role: UserRole
  ): string {
    return jwt.sign(
      { userId, email, role },
      env.jwtSecret as string,
      { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
    );
  }
}
