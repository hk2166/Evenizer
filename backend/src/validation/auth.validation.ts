import {z} from "zod";
import {UserRole} from "../models/enum.js";


export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(3,"Name must be at least 3 character long"),
        email: z.string().email("Invaild email format"),
            password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
    })
})


export const loginSchema = z.object({
  body: z.object({
    // TODO: Add fields here
  }),
});


export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];