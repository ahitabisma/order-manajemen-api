import { UserResponse } from "../api/v1/auth/models/auth.model";
import { ResponseError } from "../types/error";
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh'
}

export class Jwt {
    static accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'defaultSecretKey';
    static accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
    static refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'defaultSecretKey';
    static refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    static generateToken = (type: TokenType, user: UserResponse): string => {
        const token = type === TokenType.ACCESS ? this.accessTokenSecret : this.refreshTokenSecret;
        const expiresIn = type === TokenType.ACCESS ? this.accessTokenExpiration : this.refreshTokenExpiration;

        const refreshTokenOptions: SignOptions = {
            expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
            jwtid: type === TokenType.REFRESH ? uuidv4() : undefined,
        };

        const accessTokenOptions: SignOptions = {
            expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
        };

        return jwt.sign(user, token, type === TokenType.ACCESS ? accessTokenOptions : refreshTokenOptions);
    }

    static verifyToken = (type: TokenType, token: string): UserResponse => {
        try {
            return jwt.verify(token, type === TokenType.ACCESS ? this.accessTokenSecret : this.refreshTokenSecret) as UserResponse;
        } catch (error) {
            throw new ResponseError(403, 'Unauthorized');
        }
    }

    static calculateExpiryDate(expiry: string | number): Date {
        if (typeof expiry === 'number') {
            return new Date(Date.now() + expiry * 1000);
        }

        const match = expiry.match(/^(\d+)([smhdw])$/);
        if (!match) {
            throw new Error(`Invalid expiry format: ${expiry}. Use format like "7d", "24h", "60m", etc.`);
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        let milliseconds = 0;
        switch (unit) {
            case 's': milliseconds = value * 1000; break;
            case 'm': milliseconds = value * 60 * 1000; break;
            case 'h': milliseconds = value * 60 * 60 * 1000; break;
            case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
            case 'w': milliseconds = value * 7 * 24 * 60 * 60 * 1000; break;
            default: throw new Error(`Unknown time unit: ${unit}`);
        }

        return new Date(Date.now() + milliseconds);
    }
}