import { NextFunction, Response } from "express";
import { UserRequest } from "../../../../types/user";
import logger from "../../../../config/logger";
import { ProductService } from "../services/product.service";
import { CreateProductRequest, UpdateProductRequest } from "../models/product.model";
import path from "path";
import fs from "fs";

export class ProductController {
    // ALL
    static async all(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const { page, size } = req.query;
            const request = {
                page: parseInt(page as string) || 1,
                size: parseInt(size as string) || 10
            };

            const products = await ProductService.all(request);

            res.status(200).json({
                message: "Products retrieved successfully",
                data: products.data,
                paging: products.paging
            });
        } catch (error) {
            logger.error("Error in ProductController.all: ", error);
            next(error);
        }
    }

    // FIND
    static async find(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const productId = parseInt(req.params.id);

            const product = await ProductService.find(productId);

            res.status(200).json({
                message: "Product retrieved successfully",
                data: product
            });
        } catch (error) {
            logger.error("Error in ProductController.find: ", error);
            next(error);
        }
    }

    // CREATE
    static async create(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const data = req.body as CreateProductRequest;
            const files = req.files as Express.Multer.File[];

            if (data.price && typeof data.price === 'string') {
                data.price = parseFloat(data.price);
            }
            if (data.stock && typeof data.stock === 'string') {
                data.stock = parseInt(data.stock);
            }

            if (files) {
                data.images = files.map((file) => ({
                    url: file.filename,
                }));
            }

            const product = await ProductService.create(data);

            res.status(201).json({
                status: true,
                message: "Product created successfully",
                data: product
            });
        } catch (error) {
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const filePath = path.join(process.cwd(), 'public', 'products', file.filename);

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
            logger.error("Error in ProductController.create: ", error);
            next(error);
        }
    }

    // UPDATE
    static async update(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const productId = parseInt(req.params.id);
            const data = req.body as UpdateProductRequest;
            const files = req.files as Express.Multer.File[];

            if (data.price && typeof data.price === 'string') {
                data.price = parseFloat(data.price);
            }
            if (data.stock && typeof data.stock === 'string') {
                data.stock = parseInt(data.stock);
            }

            if (data.removeImages && typeof data.removeImages === 'string') {
                data.removeImages = JSON.parse(data.removeImages)
            }

            if (files) {
                data.newImages = files?.map((file) => ({
                    url: file.filename,
                }));
            }

            const product = await ProductService.update(productId, data);

            res.status(200).json({
                status: true,
                message: "Product updated successfully",
                data: product
            });
        } catch (error) {
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const filePath = path.join(process.cwd(), 'public', 'products', file.filename);

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
            logger.error("Error in ProductController.update: ", error);
            next(error);
        }
    }

    // DELETE
    static async delete(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const productId = parseInt(req.params.id);

            await ProductService.delete(productId);

            res.status(200).json({
                status: true,
                message: "Product deleted successfully"
            });
        } catch (error) {
            logger.error("Error in ProductController.delete: ", error);
            next(error);
        }
    }
}