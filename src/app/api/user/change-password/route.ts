import bcrypt from "bcrypt";
import { prisma } from "@/libs/prismaDb";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { criticalRateLimit } from "@/lib/rate-limit";
import { AuditLogService } from "@/lib/services/audit-log.service";

// Валидация пароля
function validatePassword(password: string): { valid: boolean; error?: string } {
	if (password.length < 8) {
		return { valid: false, error: "Пароль должен содержать минимум 8 символов" };
	}
	
	if (!/[A-Z]/.test(password)) {
		return { valid: false, error: "Пароль должен содержать хотя бы одну заглавную букву" };
	}
	
	if (!/[a-z]/.test(password)) {
		return { valid: false, error: "Пароль должен содержать хотя бы одну строчную букву" };
	}
	
	if (!/[0-9]/.test(password)) {
		return { valid: false, error: "Пароль должен содержать хотя бы одну цифру" };
	}
	
	return { valid: true };
}



export async function POST(request: NextRequest) {
	// Rate limiting
	const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	const res = NextResponse.next();
	
	try {
		await criticalRateLimit.check(res, 3, ip); // 3 попытки за 15 минут
	} catch {
		return NextResponse.json(
			{ error: "Слишком много попыток. Попробуйте позже." },
			{ status: 429 }
		);
	}

	const body = await request.json();
	const { currentPassword, password } = body;

	const session = await getServerSession(authOptions);
	const formatedEmail = session?.user?.email?.toLowerCase();

	if (!session?.user?.email) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const user = await prisma.telesklad_users.findUnique({
		where: {
			email: formatedEmail,
		},
	});

	if (!user) {
		return new NextResponse("User not found", { status: 404 });
	}

	// Проверяем текущий пароль
	const passwordMatch = await bcrypt.compare(
		currentPassword,
		user?.password as string
	);

	if (!passwordMatch) {
		// Логируем неудачную попытку
		await AuditLogService.logAuth(
			user.id,
			'PASSWORD_CHANGED',
			false,
			{ reason: 'incorrect_current_password', ip }
		);
		
		return new NextResponse("Неверный текущий пароль", { status: 400 });
	}

	// Проверяем demo пользователя
	const isDemo = user?.email?.includes("demo-");
	if (isDemo) {
		return new NextResponse("Нельзя менять пароль для демо-пользователя", {
			status: 401,
		});
	}

	// Валидация нового пароля
	const validation = validatePassword(password);
	if (!validation.valid) {
		return new NextResponse(validation.error, { status: 400 });
	}

	// Проверяем, что новый пароль отличается от старого
	const samePassword = await bcrypt.compare(password, user.password as string);
	if (samePassword) {
		return new NextResponse("Новый пароль должен отличаться от текущего", { 
			status: 400 
		});
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		await prisma.telesklad_users.update({
			where: {
				email: formatedEmail,
			},
			data: {
				password: hashedPassword,
			},
		});

		// Логируем успешную смену пароля
		await AuditLogService.logAuth(
			user.id,
			'PASSWORD_CHANGED',
			true,
			{ email: formatedEmail, ip }
		);

		return NextResponse.json({ 
			message: "Пароль успешно изменен" 
		});
	} catch (error) {
		// Логируем ошибку
		await AuditLogService.logAuth(
			user.id,
			'PASSWORD_CHANGED',
			false,
			{ error: error instanceof Error ? error.message : 'Unknown error', ip }
		);
		
		return new NextResponse("Что-то пошло не так", { status: 500 });
	}
}
