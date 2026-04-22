import { Request, Response } from "express";
import { UserRole } from "../models/enum.js";
import { AdminService } from "../services/admin.service.js";

export const getDashboardHandler = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin only route." });
    }

    const dashboard = await AdminService.getDashboardData();

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      dashboard,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
