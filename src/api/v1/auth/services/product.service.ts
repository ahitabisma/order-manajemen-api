import { Validation } from './../validation/validation';
import { prisma } from "../../../../config/database";
import { ResponseError } from "../../../../types/error";
import { Pageable, PagingRequest } from "../models/paging";
import { CreateProductRequest, ProductImage, ProductResponse, toProductResponse, UpdateProductRequest } from "../models/product.model";
import { ProductValidation } from '../validation/product.validation';
import fs from 'fs';
import path from 'path';

const productFields = {
    id: true,
    name: true,
    description: true,
    price: true,
    stock: true,
    images: {
        select: {
            id: true,
            url: true,
        },
    }
}

export class ProductService {
    // GET ALL PRODUCTS
    static async all(request: PagingRequest): Promise<Pageable<ProductResponse>> {
        const page = Math.max(Number(request.page ?? 1), 1);
        const size = Math.max(Number(request.size ?? 10), 1);
        const skip = (page - 1) * size;

        const [total, products] = await Promise.all([
            prisma.product.count(),
            prisma.product.findMany({
                skip,
                take: size,
                orderBy: { id: 'asc' },
                select: productFields,
            }),
        ]);

        const productResponses: ProductResponse[] = products.map(product =>
            toProductResponse(product)
        );

        return {
            data: productResponses,
            paging: {
                current_page: page,
                total_page: Math.max(Math.ceil(total / size), 1),
                size,
                total_data: total,
            },
        };
    }

    // GET PRODUCT BY ID
    static async find(productId: number) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: productFields,
        });

        if (!product) {
            throw new ResponseError(404, `Product with ID ${productId} not found`);
        }

        return toProductResponse(product);
    }

    // CREATE PRODUCT
    static async create(request: CreateProductRequest): Promise<ProductResponse> {
        const data = Validation.validate(ProductValidation.CREATE, request);

        const { images, ...productData } = data;

        const product = await prisma.product.create({
            data: productData,
            select: productFields,
        });

        if (images && images.length > 0) {
            await prisma.productImage.createMany({
                data: images.map((image: ProductImage) => ({
                    productId: product.id,
                    url: image.url,
                })),
            });

            const productWithImages = await prisma.product.findUnique({
                where: { id: product.id },
                select: productFields,
            });

            return toProductResponse(productWithImages);
        }

        return toProductResponse(product);
    }

    // UPDATE PRODUCT
    static async update(productId: number, request: UpdateProductRequest): Promise<ProductResponse> {
        const data = Validation.validate(ProductValidation.UPDATE, request);

        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: { images: true }
        });

        if (!existingProduct) {
            throw new ResponseError(404, `Product with ID ${productId} not found`);
        }

        if (data.removeImages && data.removeImages.length > 0) {
            const imagesToRemove = await prisma.productImage.findMany({
                where: {
                    id: { in: data.removeImages },
                    productId: productId
                }
            });

            imagesToRemove.forEach(image => {
                const filePath = path.join('public/products', image.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });

            await prisma.productImage.deleteMany({
                where: {
                    id: { in: data.removeImages },
                    productId: productId
                }
            });
        }

        if (data.newImages && data.newImages.length > 0) {
            await prisma.productImage.createMany({
                data: data.newImages.map((image: ProductImage) => ({
                    productId: productId,
                    url: image.url,
                })),
            });
        }

        const { newImages, removeImages, ...productData } = data;

        const product = await prisma.product.update({
            where: { id: productId },
            data: productData,
            select: productFields,
        });

        return toProductResponse(product);
    }

    // DELETE PRODUCT
    static async delete(productId: number): Promise<boolean> {
        const existingProduct = await this.ensureProductExist(productId);

        existingProduct.images.forEach(image => {
            const filePath = path.join('public/products', image.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await prisma.productImage.deleteMany({
            where: { productId: productId }
        });

        await prisma.product.delete({
            where: { id: productId }
        });

        return true;
    }

    // Helper
    static async ensureProductExist(productId: number) {
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: { images: true }
        });

        if (!existingProduct) {
            throw new ResponseError(404, `Product with ID ${productId} not found`);
        }

        return existingProduct;
    }
}