import { prisma } from '../../src/config/database';
import { OrderStatus } from '../../generated/prisma';

async function main() {
    console.log('Starting order seeding...');

    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    await prisma.$executeRawUnsafe(`ALTER SEQUENCE orders_id_seq RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE order_items_id_seq RESTART WITH 1;`);

    console.log('Cleaned up existing order data');

    // Ambil data user dan product yang sudah ada
    const users = await prisma.user.findMany();
    const products = await prisma.product.findMany();

    if (users.length === 0) {
        throw new Error('No users found. Please run user seeder first.');
    }

    if (products.length === 0) {
        throw new Error('No products found. Please run product seeder first.');
    }

    // Cari customer (bukan admin)
    const customers = users.filter(user => user.role === 'CUSTOMER');

    if (customers.length === 0) {
        throw new Error('No customer users found.');
    }

    const orders = [
        {
            userId: customers[0].id,
            status: OrderStatus.COMPLETED,
            items: [
                { productId: products[0].id, quantity: 1, price: products[0].price },
                { productId: products[4].id, quantity: 2, price: products[4].price }
            ]
        },
        {
            userId: customers[0].id,
            status: OrderStatus.PENDING,
            items: [
                { productId: products[1].id, quantity: 1, price: products[1].price }
            ]
        },
        {
            userId: customers.length > 1 ? customers[1].id : customers[0].id,
            status: OrderStatus.COMPLETED,
            items: [
                { productId: products[2].id, quantity: 1, price: products[2].price },
                { productId: products[3].id, quantity: 1, price: products[3].price }
            ]
        },
        {
            userId: customers[0].id,
            status: OrderStatus.CANCELED,
            items: [
                { productId: products[4].id, quantity: 3, price: products[4].price }
            ]
        }
    ];

    for (const orderData of orders) {
        const { items, ...orderInfo } = orderData;

        // Hitung total amount
        const totalAmount = items.reduce((total, item) => {
            return total + (Number(item.price) * item.quantity);
        }, 0);

        const order = await prisma.order.create({
            data: {
                ...orderInfo,
                totalAmount,
                items: {
                    create: items
                }
            },
            include: {
                items: true,
                user: true
            }
        });

        console.log(`Created order for ${order.user.name} with total: Rp ${order.totalAmount.toLocaleString()}`);
    }

    console.log('Order seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('Error during order seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });