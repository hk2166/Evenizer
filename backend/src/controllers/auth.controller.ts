import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import {
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
} from "../validation/auth.validation.js";

export const registerHandler = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
) => {
  const { name, email, password, role } = req.body;
  const result = await AuthService.register(name, email, password, role);

  if ("error" in result) {
    return result.error === "Email already registered"
      ? res.status(409).json({ message: result.error })
      : res.status(400).json({ message: result.error });
  }

  return res
    .status(201)
    .json({
      message: "User registered successfully",
      token: result.token,
      user: result.user,
    });
};

export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  if ("error" in result) {
    return res.status(401).json({ message: result.error });
  }

  return res
    .status(200)
    .json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
};

export const googleLoginHandler = async (
  req: Request<{}, {}, GoogleLoginInput>,
  res: Response,
) => {
  const { credential } = req.body;
  const result = await AuthService.loginWithGoogle(credential);

  if ("error" in result) {
    return res.status(401).json({ message: result.error });
  }

  return res
    .status(200)
    .json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
};

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  const jwtUser = req.user!;
  const user = await AuthService.getUserById(jwtUser.userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({
    message: "User retrieved successfully",
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
