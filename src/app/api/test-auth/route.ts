import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Проверяем пользователя в базе данных
    const user = await prisma.telesklad_users.findUnique({
      where: {
        email: 'go@osama.agency'
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Пользователь не найден",
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      message: "Пользователь найден",
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при проверке пользователя:', error);
    return NextResponse.json({
      success: false,
      message: "Ошибка сервера",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Тест аутентификации:', { email, hasPassword: !!password });

    // Проверяем пользователя в базе данных
    const user = await prisma.telesklad_users.findUnique({
      where: {
        email: email
      }
    });

    if (!user) {
      console.log('❌ Пользователь не найден');
      return NextResponse.json({
        success: false,
        message: "Пользователь не найден"
      });
    }

    console.log('👤 Пользователь найден:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    if (!user.password) {
      console.log('❌ У пользователя нет пароля');
      return NextResponse.json({
        success: false,
        message: "У пользователя нет пароля"
      });
    }

    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Проверка пароля:', { passwordMatch });

    return NextResponse.json({
      success: true,
      message: passwordMatch ? "Пароль правильный" : "Пароль неправильный",
      data: {
        passwordMatch,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при тестировании аутентификации:', error);
    return NextResponse.json({
      success: false,
      message: "Ошибка сервера",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 