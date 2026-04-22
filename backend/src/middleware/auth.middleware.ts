// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRole } from "../models/enum.js";


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const authHeader = req.headers.authorization;

  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      message: "No token provided. Please login first." 
    });
  }

  
  const token = authHeader.split(" ")[1];

  
  try {
    
    const decoded = jwt.verify(token, env.jwtSecret as string) as {
      userId: string;
      email: string;
      role: UserRole;
    };

    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    
    next();
  } catch (error) {
    
    return res.status(401).json({ 
      message: "Invalid or expired token. Please login again." 
    });
  }
};

export const requireRoles =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
