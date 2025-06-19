import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
	return new NextResponse("Token verification functionality is temporarily disabled", { status: 501 });
};
