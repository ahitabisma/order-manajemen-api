import { Request } from "express";
import { UserResponse } from "../api/v1/auth/models/auth.model";

export interface UserRequest extends Request {
    user?: UserResponse;
}