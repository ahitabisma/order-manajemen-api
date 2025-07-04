import { execSync } from 'child_process';

const args = process.argv.slice(2);

async function runSeeder() {
    if (args.length === 0) {
        console.log('Running all seeders...\n');
        await runAllSeeders();
        return;
    }

    const seederType = args[0].replace('--', '');
    
    switch (seederType) {
        case 'user':
            console.log('Running user seeder...');
            execSync('npx ts-node prisma/seeders/user.ts', { stdio: 'inherit' });
            break;
            
        case 'product':
            console.log('Running product seeder...');
            execSync('npx ts-node prisma/seeders/product.ts', { stdio: 'inherit' });
            break;
            
        case 'order':
            console.log('Running order seeder...');
            execSync('npx ts-node prisma/seeders/order.ts', { stdio: 'inherit' });
            break;
            
        case 'all':
            console.log('Running all seeders...');
            await runAllSeeders();
            break;
            
        default:
            console.error(`❌ Unknown seeder: ${seederType}`);
            console.log('Available seeders:');
            console.log('  --user     Run user seeder');
            console.log('  --product  Run product seeder');
            console.log('  --order    Run order seeder');
            console.log('  --all      Run all seeders');
            process.exit(1);
    }
    
    console.log('✅ Seeding completed successfully!');
}

async function runAllSeeders() {
    try {
        console.log('1. Running user seeder...');
        execSync('npx ts-node prisma/seeders/user.ts', { stdio: 'inherit' });
        
        console.log('\n2. Running product seeder...');
        execSync('npx ts-node prisma/seeders/product.ts', { stdio: 'inherit' });
        
        console.log('\n3. Running order seeder...');
        execSync('npx ts-node prisma/seeders/order.ts', { stdio: 'inherit' });
        
    } catch (error) {
        console.error('❌ Error running seeders:', error);
        process.exit(1);
    }
}

runSeeder().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});