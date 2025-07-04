import { NextFunction, Response } from "express";
import { UserRequest } from "../../../../types/user";
import logger from "../../../../config/logger";
import { OrderService } from "../services/order.service";

export class OrderController {
    // CREATE ORDER
    static async create(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const data = req.body;

            if (data.items && Array.isArray(data.items)) {
                data.items = data.items.map((item: any) => ({
                    productId: typeof item.productId === 'string' ? parseInt(item.productId) : item.productId,
                    quantity: typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity,
                }));
            }

            const order = await OrderService.create(userId, data);

            res.status(201).json({
                status: true,
                message: "Order created successfully",
                data: order
            });
        } catch (error) {
            logger.error("Error in OrderController.create: ", error);
            next(error);
        }
    }

    // ORDER HISTORY BY USER
    static async history(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { page, size } = req.query;
            const request = {
                page: parseInt(page as string) || 1,
                size: parseInt(size as string) || 10
            };

            const orders = await OrderService.history(userId, request);

            res.status(200).json({
                status: true,
                message: "Order history retrieved successfully",
                data: orders.data,
                paging: orders.paging
            });
        } catch (error) {
            logger.error("Error in OrderController.getHistory: ", error);
            next(error);
        }
    }

    // GET ORDER BY ID
    static async find(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const orderId = parseInt(req.params.id);

            const order = await OrderService.find(orderId, userId);

            res.status(200).json({
                status: true,
                message: "Order retrieved successfully",
                data: order
            });
        } catch (error) {
            logger.error("Error in OrderController.findById: ", error);
            next(error);
        }
    }
}