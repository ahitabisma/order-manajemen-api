import { Role, User } from "../../../../../generated/prisma";

export interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    photo?: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface UpdateUserProfileRequest {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    photo?: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    photo?: string;
    role: Role;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo || undefined,
        role: user.role,
    };
}