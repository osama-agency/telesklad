export async function PUT(req: Request) {
  try {
    const updatedProduct = await prisma.product.update({
      // ... логика обновления ...
    });

    // Инвалидируем кэш для продуктов
    revalidateTag('products');

    return NextResponse.json(updatedProduct);
  } catch (error) {
    // ... обработка ошибок ...
  }
} 