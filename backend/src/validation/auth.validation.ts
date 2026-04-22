// backend/src/validation/auth.validation.ts
import { z } from "zod";
import { UserRole } from "../models/enum.js";

/**
 * Validation schema for user registration
 * Includes password confirmation check using .refine()
 */
export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters long"),
      email: z.email({ message: "Invalid email format" }),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
      confirmPassword: z.string(),
      role: z
        .enum([UserRole.ADMIN, UserRole.ORGANIZER, UserRole.CUSTOMER])
        .refine(
          (val) => val === UserRole.CUSTOMER || val === UserRole.ORGANIZER,
          { message: "Role must be either 'customer' or 'organizer'" },
        ),
    })
    // Custom validation: Check if passwords match
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // Error will be attached to confirmPassword field
    }),
});

/**
 * Validation schema for user login
 * Only needs email and password
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(1, { message: "Password is required" }),
  }),
});

/**
 * Validation schema for Google sign-in
 * Expects a Google ID token returned by the client-side Google button
 */
export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().min(1, { message: "Google credential is required" }),
  }),
});

/**
 * TypeScript types inferred from schemas
 * Use these in controllers for type safety
 */
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>["body"];
