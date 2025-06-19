import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/webapp/favorites/[id] - удалить товар из избранного
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (!productId || isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'Неверный ID товара' },
        { status: 400 }
      );
    }

    // В реальном проекте здесь будет удаление из БД
    // await prisma.favorite.deleteMany({
    //   where: {
    //     user_id: currentUser.id,
    //     product_id: productId
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Удалено из избранного',
      product_id: productId
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления из избранного' },
      { status: 500 }
    );
  }
} 