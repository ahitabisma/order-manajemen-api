import bcrypt from 'bcrypt';
import { prisma } from '../../src/config/database';
import { Role } from '../../generated/prisma';
import { clearFolder } from './clearFiles';

async function main() {
    console.log('Starting seeding...');

    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Cleaned up existing data');

    await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);

    clearFolder('public/profile');

    const defaultPassword = await bcrypt.hash('123123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: defaultPassword,
            role: Role.ADMIN
        }
    });
    console.log(`Created admin user with id: ${admin.id}`);

    const customer = await prisma.user.create({
        data: {
            name: 'Customer',
            email: 'customer@example.com',
            password: defaultPassword,
            role: Role.CUSTOMER
        }
    });
    console.log(`Created customer with id: ${customer.id}`);

    console.log('Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });