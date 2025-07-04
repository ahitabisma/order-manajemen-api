import { NextFunction, Response } from "express";
import { ResponseError } from "../types/error";
import { UserRequest } from "../types/user";

export const roleMiddleware = (allowedRoles: Array<'ADMIN' | 'CUSTOMER'>) => {
    return (req: UserRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new ResponseError(401, "Unauthorized");
            }

            const userRole = req.user.role;

            if (!allowedRoles.includes(userRole)) {
                throw new ResponseError(403, "Forbidden");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const roleAdmin = roleMiddleware(['ADMIN']);
export const roleCustomer = roleMiddleware(['CUSTOMER']);
