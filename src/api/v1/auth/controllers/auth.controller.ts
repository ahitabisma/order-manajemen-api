import { Request, Response, NextFunction } from "express";
import logger from "../../../../config/logger";
import { UserRequest } from "../../../../types/user";
import { LoginUserRequest, RegisterUserRequest, UpdateUserProfileRequest } from "../models/auth.model";
import { AuthService } from "../services/auth.service";
import { ResponseError } from "../../../../types/error";
import path from "path";
import fs from 'fs';

export class AuthController {
    // REGISTER
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as RegisterUserRequest;

            const response = await AuthService.register(data);

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: response,
            });
        } catch (error) {
            logger.error("Error in AuthController.register: ", error);
            next(error);
        }
    }

    // LOGIN
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as LoginUserRequest;

            const response = await AuthService.login(data);

            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
            });

            const { refreshToken, ...newResponse } = response;

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: newResponse,
            });
        } catch (error) {
            logger.error("Error in AuthController.login: ", error);
            next(error);
        }
    }

    // GET CURRENT USER
    static async current(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user;

            res.status(200).json({
                success: true,
                message: "Current user retrieved successfully",
                data: user,
            });
        } catch (error) {
            logger.error("Error in AuthController.current: ", error);
            next(error);
        }
    }

    // LOGOUT
    static async logout(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                await AuthService.logout(refreshToken);
            }

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
            });

            res.status(200).json({
                success: true,
                message: "User logged out successfully",
            });
        } catch (error) {
            logger.error("Error in AuthController.logout: ", error);
            next(error);
        }
    }

    // REFRESH TOKEN
    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                throw new ResponseError(401, "Unauthorized: No refresh token provided");
            }

            const response = await AuthService.refresh(refreshToken);

            res.cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
            });

            const { refreshToken: newRefreshToken, ...newResponse } = response;

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: newResponse,
            });

        } catch (error) {
            logger.error("Error in AuthController.refresh: ", error);
            next(error);
        }
    }

    // UPDATE PROFILE
    static async update(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body as UpdateUserProfileRequest;

            if (req.file) {
                data.photo = req.file.filename;
            } else if (req.body.removePhoto === 'true') {
                data.photo = undefined;
            }

            const response = await AuthService.update(req, data);

            res.status(200).json({
                success: true,
                message: "User profile updated successfully",
                data: response,
            });
        } catch (error) {
            if (req.file) {
                const filePath = path.join(path.join(process.cwd(), 'public', 'profile', req.file.filename));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            logger.error("Error in AuthController.update: ", error);
            next(error);
        }
    }
}