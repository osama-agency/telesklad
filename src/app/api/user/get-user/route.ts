import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return new NextResponse("User not found", { status: 400 });
	}

	try {
		const user = await prisma.telesklad_users.findUnique({
			where: {
				email: session.user.email,
			},
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		return new NextResponse("Something went wrong", { status: 500 });
	}
} 