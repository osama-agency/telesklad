const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const count = await prisma.products.count();
    console.log(`✅ Database connected successfully. Found ${count} products.`);
    
    // Test specific product query
    const firstProduct = await prisma.products.findFirst({
      select: {
        id: true,
        name: true,
        stock_quantity: true,
        price: true,
        old_price: true
      }
    });
    
    if (firstProduct) {
      console.log('📦 Sample product:', firstProduct);
      
      // Test update capability
      const updateTest = await prisma.products.update({
        where: { id: firstProduct.id },
        data: { updated_at: new Date() },
        select: { id: true, updated_at: true }
      });
      
      console.log('✅ Update test successful:', updateTest);
    } else {
      console.log('⚠️ No products found in database');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 