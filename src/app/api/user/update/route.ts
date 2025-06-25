import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
	const body = await request.json();
	const { email, name, image, phone } = body;

	const session = await getServerSession(authOptions);
	const updateData: { [key: string]: any } = {};

	const isDemo = session?.user?.email?.includes("demo-");

	if (!session?.user) {
		return new NextResponse(JSON.stringify("User not found!"), { status: 400 });
	}

	if (body === null) {
		return new NextResponse(JSON.stringify("Missing Fields"), { status: 400 });
	}

	if (name) {
		updateData.name = name;
	}

	if (email) {
		updateData.email = email.toLowerCase();
	}

	if (image) {
		updateData.image = image;
	}

	if (phone) {
		updateData.phone = phone;
	}

	if (isDemo) {
		return new NextResponse(JSON.stringify("Can't update demo user"), {
			status: 401,
		});
	}

	try {
		const user = await prisma.telesklad_users.update({
			where: {
				email: session?.user?.email as string,
			},
			data: {
				...updateData,
			},
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
			},
		});

		revalidatePath("/pages/settings");

		return NextResponse.json(user, { status: 200 });
	} catch (error) {
		console.error("Error updating user:", error);
		return new NextResponse("Something went wrong", { status: 500 });
	}
}

export async function PUT(request: Request) {
	const body = await request.json();

	try {
		const user = await prisma.telesklad_users.update({
			where: {
				email: body.email.toLowerCase(),
			},
			data: {
				...body,
				email: body.email.toLowerCase(),
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		return new NextResponse("Something went wrong", { status: 500 });
	}
}
