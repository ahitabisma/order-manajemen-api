import { Product } from "../../../../../generated/prisma";

export interface ProductImage {
    url: string;
}

export interface ProductResponse {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    images?: {
        id: number;
        url: string;
    };
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stock: number;
    images?: ProductImage[];
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    newImages?: ProductImage[];
    removeImages?: number[];
}

export function toProductResponse(data: Product | any): ProductResponse {
    return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        stock: data.stock,
        images: (data.images || []).map((image: { id: number, url: string }) => ({
            id: image.id,
            url: image.url,
        })),
    };
}