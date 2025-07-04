import { prisma } from "../../../../config/database";
import { ResponseError } from "../../../../types/error";
import { UserRequest } from "../../../../types/user";
import { LoginUserRequest, RegisterUserRequest, toUserResponse, UpdateUserProfileRequest, UserResponse } from "../models/auth.model";
import { AuthValidation } from "../validation/auth.validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { Jwt, TokenType } from "../../../../utils/jwt";
import path from "path";
import fs from "fs";
import logger from "../../../../config/logger";

export class AuthService {

    // REGISTER
    static async register(request: RegisterUserRequest): Promise<UserResponse> {
        const data = Validation.validate(AuthValidation.REGISTER, request);

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new ResponseError(400, "Email already exists");
        }

        data.password = await bcrypt.hash(data.password, 10);

        const { confirmPassword, ...userData } = data;

        const user = await prisma.user.create({ data: userData });

        return toUserResponse(user) as UserResponse;
    }

    // LOGIN
    static async login(request: LoginUserRequest) {
        const data = Validation.validate(AuthValidation.LOGIN, request);

        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new ResponseError(400, "Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new ResponseError(400, "Invalid email or password");
        }

        const userResponse = toUserResponse(user) as UserResponse;

        // Access Token menggunakan JWT
        const accessToken = Jwt.generateToken(TokenType.ACCESS, userResponse);

        // Refresh Token menggunakan JWT
        const refreshToken = Jwt.generateToken(TokenType.REFRESH, userResponse);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: Jwt.calculateExpiryDate(Jwt.refreshTokenExpiration),
            }
        });

        return {
            user: userResponse,
            token: accessToken,
            refreshToken: refreshToken
        };
    }

    // GET CURRENT USER
    static async current(request: UserRequest): Promise<UserResponse> {
        return request.user;
    }

    // LOGOUT
    static async logout(refreshToken: string): Promise<boolean> {
        if (!refreshToken) {
            throw new ResponseError(401, "Unauthorized");
        }

        const refreshTokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });

        if (!refreshTokenRecord) {
            throw new ResponseError(401, "Unauthorized");
        }

        await prisma.refreshToken.delete({
            where: { id: refreshTokenRecord.id }
        });

        return true;
    }

    // REFRESH TOKEN
    static async refresh(token: string) {
        const refreshToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!refreshToken) {
            throw new ResponseError(401, "Invalid refresh token");
        }

        if (refreshToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({
                where: { id: refreshToken.id }
            });

            throw new ResponseError(401, "Refresh token expired");
        }

        if (refreshToken.revoked) {
            throw new ResponseError(401, "Refresh token revoked");
        }

        const userResponse = toUserResponse(refreshToken.user);

        // Access token
        const accessToken = Jwt.generateToken(TokenType.ACCESS, userResponse);

        // Refresh token
        const newRefreshToken = Jwt.generateToken(TokenType.REFRESH, userResponse);

        await prisma.refreshToken.update({
            where: { id: refreshToken.id },
            data: {
                token: newRefreshToken,
                expiresAt: Jwt.calculateExpiryDate(Jwt.refreshTokenExpiration),
            }
        });

        return {
            user: userResponse,
            token: accessToken,
            refreshToken: newRefreshToken
        };
    }

    // UPDATE PROFILE
    static async update(userRequest: UserRequest, request: UpdateUserProfileRequest): Promise<UserResponse> {
        const data = Validation.validate(AuthValidation.UPDATE_PROFILE, request);

        const userId = userRequest.user.id;

        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            throw new ResponseError(404, "User not found");
        }

        if (data.email && data.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: {
                    email: data.email,
                    NOT: { id: userId }
                }
            });

            if (emailExists) {
                throw new ResponseError(400, "Email already exists");
            }
        }

        if (data.password && data.password !== data.confirmPassword) {
            throw new ResponseError(400, "Passwords do not match");
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        if (data.photo !== undefined) {
            if ((data.photo && existingUser.photo) || (data.photo === null && existingUser.photo)) {
                await this.deletePhoto(existingUser.photo);
            }
        } else if (data.photo === undefined && existingUser.photo) {
            await this.deletePhoto(existingUser.photo);
        }

        const { confirmPassword, ...updateData } = data;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return toUserResponse(updatedUser) as UserResponse;
    }

    private static async deletePhoto(photo: string): Promise<void> {
        try {
            const photoPath = path.join(process.cwd(), 'public', 'profile', photo);

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        } catch (error) {
            logger.error(`Failed to delete photo file: ${photo}`, error);
        }
    }
}