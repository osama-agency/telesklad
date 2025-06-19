import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function DELETE(request: Request) {
	const body = await request.json();
	const { email } = body;

	const session = await getServerSession(authOptions);

	const user = await prisma.telesklad_user.findUnique({
		where: {
			email: email.toLowerCase(),
		},
	});

	const isOthorized = session?.user?.email === email || user?.role === "ADMIN";

	if (!isOthorized) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const isDemo = user?.email?.includes("demo-");

	if (isDemo) {
		return new NextResponse("Can't delete demo user", { status: 401 });
	}

	try {
		const user = await prisma.telesklad_user.delete({
			where: {
				email: email.toLowerCase(),
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		return new NextResponse("Something went wrong", { status: 500 });
	}
}
