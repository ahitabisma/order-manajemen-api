import { prisma } from '../../src/config/database';
import { clearFolder } from './clearFiles';

async function main() {
    console.log('Starting product seeding...');

    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});

    await prisma.$executeRawUnsafe(`ALTER SEQUENCE products_id_seq RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE product_images_id_seq RESTART WITH 1;`);

    clearFolder('public/products');

    console.log('Cleaned up existing product data');

    const products = [
        {
            name: 'Laptop Gaming ASUS ROG',
            description: 'Laptop gaming dengan spesifikasi tinggi untuk para gamer profesional',
            price: 15000000,
            stock: 25,
            images: [
                { url: 'https://example.com/images/laptop-asus-1.jpg' },
                { url: 'https://example.com/images/laptop-asus-2.jpg' }
            ]
        },
        {
            name: 'iPhone 15 Pro Max',
            description: 'Smartphone flagship terbaru dari Apple dengan kamera yang canggih',
            price: 20000000,
            stock: 15,
            images: [
                { url: 'https://example.com/images/iphone-15-1.jpg' },
                { url: 'https://example.com/images/iphone-15-2.jpg' }
            ]
        },
        {
            name: 'Samsung Galaxy Tab S9',
            description: 'Tablet Android premium dengan layar AMOLED dan S Pen',
            price: 8500000,
            stock: 30,
            images: [
                { url: 'https://example.com/images/galaxy-tab-1.jpg' }
            ]
        },
        {
            name: 'MacBook Air M3',
            description: 'Laptop tipis dan ringan dengan chip M3 yang powerful',
            price: 18000000,
            stock: 20,
            images: [
                { url: 'https://example.com/images/macbook-air-1.jpg' },
                { url: 'https://example.com/images/macbook-air-2.jpg' }
            ]
        },
        {
            name: 'Headphone Sony WH-1000XM5',
            description: 'Headphone wireless dengan noise cancelling terbaik di kelasnya',
            price: 4500000,
            stock: 50,
            images: [
                { url: 'https://example.com/images/sony-headphone-1.jpg' }
            ]
        }
    ];

    for (const productData of products) {
        const { images, ...productInfo } = productData;

        const product = await prisma.product.create({
            data: {
                ...productInfo,
                images: {
                    create: images
                }
            }
        });

        console.log(`Created product: ${product.name} with id: ${product.id}`);
    }

    console.log('Product seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('Error during product seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });