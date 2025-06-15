import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
			status: 401 
		});
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				email: session.user.email,
			},
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				image: true,
				role: true,
				createdAt: true,
			},
		});

		if (!user) {
			return new NextResponse(JSON.stringify({ error: "User not found" }), { 
				status: 404 
			});
		}

		return NextResponse.json(user, { status: 200 });
	} catch (error) {
		console.error("Error fetching user:", error);
		return new NextResponse(JSON.stringify({ error: "Something went wrong" }), { 
			status: 500 
		});
	}
} 