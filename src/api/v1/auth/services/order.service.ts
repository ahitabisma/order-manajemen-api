import { Validation } from '../validation/validation';
import { prisma } from "../../../../config/database";
import { ResponseError } from "../../../../types/error";
import { Pageable, PagingRequest } from "../models/paging";
import { CreateOrderRequest, OrderResponse, Item, toOrderResponse } from "../models/order.model";
import { OrderValidation } from '../validation/order.validation';
import { OrderStatus } from "../../../../../generated/prisma";

export class OrderService {
    // CREATE ORDER
    static async create(userId: number, request: { items: Item[] }): Promise<OrderResponse> {
        const data = Validation.validate(OrderValidation.CREATE, request);

        return await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItems: Item[] = [];

            for (const item of data.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new ResponseError(404, `Product with ID ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new ResponseError(400, `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                }

                const itemTotal = Number(product.price) * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: Number(product.price)
                });

                // Kurangi stok product
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: product.stock - item.quantity }
                });
            }

            // Buat order
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    totalAmount: totalAmount,
                    status: OrderStatus.PENDING,
                },
                include: {
                    items: true,
                }
            });

            // Order items
            await tx.orderItem.createMany({
                data: orderItems.map(item => ({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            const completeOrder = await tx.order.findUnique({
                where: { id: order.id },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                }
            });

            return toOrderResponse(completeOrder!);
        });
    }

    // GET ORDER HISTORY BY USER
    static async history(userId: number, request: PagingRequest): Promise<Pageable<OrderResponse>> {
        const page = Math.max(Number(request.page ?? 1), 1);
        const size = Math.max(Number(request.size ?? 10), 1);
        const skip = (page - 1) * size;

        const [total, orders] = await Promise.all([
            prisma.order.count({
                where: { userId: userId }
            }),
            prisma.order.findMany({
                where: { userId: userId },
                skip,
                take: size,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                }
            })
        ]);

        const orderResponses: OrderResponse[] = orders.map(order => toOrderResponse(order));

        return {
            data: orderResponses,
            paging: {
                current_page: page,
                total_page: Math.max(Math.ceil(total / size), 1),
                size,
                total_data: total,
            },
        };
    }

    // GET ORDER BY ID
    static async find(orderId: number, userId: number): Promise<OrderResponse> {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            throw new ResponseError(404, `Order with ID ${orderId} not found`);
        }

        return toOrderResponse(order);
    }
}