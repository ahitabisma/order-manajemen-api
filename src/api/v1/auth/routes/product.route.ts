import { Router } from "express";
import { roleAdmin } from "../../../../middlewares/role.middleware";
import { authMiddleware } from "../../../../middlewares/auth.middleware";
import { ProductController } from "../controllers/product.controller";
import { uploadProducts } from "../../../../config/multer";

export const productRoutes = Router();

productRoutes.get("/products", [authMiddleware, roleAdmin], ProductController.all);
productRoutes.get("/products/:id", [authMiddleware, roleAdmin], ProductController.find);
productRoutes.post("/products", [authMiddleware, roleAdmin], uploadProducts, ProductController.create);
productRoutes.put("/products/:id", [authMiddleware, roleAdmin], uploadProducts, ProductController.update);
productRoutes.delete("/products/:id", [authMiddleware, roleAdmin], ProductController.delete);