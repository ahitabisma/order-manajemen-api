import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { roleCustomer } from "../../../../middlewares/role.middleware";

export const orderRoutes = Router();

orderRoutes.post("/orders", [authMiddleware, roleCustomer], OrderController.create);
orderRoutes.get("/orders/history", [authMiddleware, roleCustomer], OrderController.history);
orderRoutes.get("/orders/:id", [authMiddleware, roleCustomer], OrderController.find);