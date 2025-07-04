import { Request } from "express";
import { UserJwtPayload } from "../api/v1/auth/models/auth.model";

export interface UserRequest extends Request {
    user?: UserJwtPayload;
}