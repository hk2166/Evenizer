import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { UserRole } from "../models/enum.js";
import { env } from "../config/env.js";

type AuthSuccess = {
  token: string;
  user: { userId: string; name: string; email: string; role: UserRole };
};
type AuthError = { error: string };
type AuthResponse = AuthSuccess | AuthError;

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing) return { error: "Email already registered" };

    if (role !== UserRole.CUSTOMER && role !== UserRole.ORGANIZER) {
      return { error: "Invalid user role" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ name, email: normalizedEmail, password: hashedPassword, role })
      .returning();

    const token = this.generateToken(
      newUser.id,
      newUser.email,
      newUser.role as UserRole,
    );
    return {
      token,
      user: {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
      },
    };
  }

  static async loginWithGoogle(credential: string): Promise<AuthResponse> {
    if (!env.googleClientId) {
      return { error: "Google login is not configured" };
    }

    const client = new OAuth2Client(env.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return { error: "Google account did not return an email" };
    }

    if (!payload.email_verified) {
      return { error: "Google account email is not verified" };
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const displayName =
      payload.name?.trim() ||
      payload.given_name?.trim() ||
      normalizedEmail.split("@")[0];

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let user = existingUser;

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          name: displayName,
          email: normalizedEmail,
          password: hashedPassword,
          role: UserRole.CUSTOMER,
        })
        .returning();

      user = newUser;
    }

    const token = this.generateToken(
      user.id,
      user.email,
      user.role as UserRole,
    );
    return {
      token,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) return { error: "Invalid email or password" };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { error: "Invalid email or password" };

    const token = this.generateToken(
      user.id,
      user.email,
      user.role as UserRole,
    );
    return {
      token,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  }

  static async getUserById(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user || null;
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
