import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { uploadPhotoProfile } from "../../../../config/multer";

export const authRoutes = Router();

authRoutes.post("/auth/register", AuthController.register);
authRoutes.post("/auth/login", AuthController.login);
authRoutes.get("/auth/current", authMiddleware, AuthController.current);
authRoutes.post("/auth/logout", authMiddleware, AuthController.logout);
authRoutes.post("/auth/refresh", AuthController.refresh);
authRoutes.put(
    "/auth/profile",
    authMiddleware,
    uploadPhotoProfile,
    AuthController.update
);