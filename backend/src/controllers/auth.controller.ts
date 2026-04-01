// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { RegisterInput, LoginInput } from "../validation/auth.validation.js";


export const registerHandler = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
) => {
  const { name, email, password, role } = req.body;

  const result = await AuthService.register(name, email, password, role);

  if ("error" in result) {
    if (result.error === "Email already registered") {
      return res.status(409).json({ message: result.error });
    }
    return res.status(400).json({ message: result.error });
  }

  return res.status(201).json({
    message: "User registered successfully",
    token: result.token,
    user: result.user,
  });
};


export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
) => {
  
  const { email, password } = req.body;

  
  const result = await AuthService.login(email, password);

  
  if ("error" in result) {
    
    return res.status(401).json({ message: result.error });
  }

  
  return res.status(200).json({
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
};
