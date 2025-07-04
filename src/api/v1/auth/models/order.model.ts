import { OrderStatus } from "../../../../../generated/prisma";

export interface Item {
    productId: number;
    quantity: number;
    price: number;
}

export interface OrderItem extends Item {
    id: number;
    orderId: number;
    productName?: string;
}

export interface CreateOrderRequest {
    items: Item[];
}

export interface OrderResponse {
    id: number;
    userId: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}

export function toOrderResponse(order: any): OrderResponse {
    return {
        id: order.id,
        userId: order.userId,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item: any) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            productName: item.product?.name,
            quantity: item.quantity,
            price: Number(item.price)
        }))
    };
}