import { NextFunction, Response } from "express";
import { ResponseError } from "../types/error";
import { UserRequest } from "../types/user";
import { Jwt, TokenType } from "../utils/jwt";
import { prisma } from "../config/database";
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || !refreshToken) {
        throw new ResponseError(401, "Unauthorized");
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = Jwt.verifyToken(TokenType.ACCESS, token);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
        });

        if (!user) {
            throw new ResponseError(401, "Unauthorized");
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ResponseError(401, "Token expired");
        } else {
            throw new ResponseError(401, "Unauthorized");
        }
    }
}