import bcrypt from "bcrypt";
import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function POST(request: Request) {
	const body = await request.json();
	const { currentPassword, password } = body;

	const session = await getServerSession(authOptions);
	const formatedEmail = session?.user?.email?.toLowerCase();

	const user = await prisma.telesklad_user.findUnique({
		where: {
			email: formatedEmail,
		},
	});

	if (!user) {
		throw new Error("Email does not exists");
	}

	// check to see if passwords match
	const passwordMatch = await bcrypt.compare(
		currentPassword,
		user?.password as string
	);

	if (!passwordMatch) {
		return new NextResponse("Incorrect current password!", { status: 400 });
	}

	const isDemo = user?.email?.includes("demo-");

	if (isDemo) {
		return new NextResponse("Can't change password for demo user", {
			status: 401,
		});
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		await prisma.telesklad_user.update({
			where: {
				email: formatedEmail,
			},
			data: {
				password: hashedPassword,
			},
		});

		return new NextResponse("Password changed successfully", { status: 200 });
	} catch (error) {
		return new NextResponse("Something went wrong", { status: 500 });
	}
}
