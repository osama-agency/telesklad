import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return new NextResponse("Password reset functionality is temporarily disabled", { status: 501 });
}
