import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { isAdmin, checkAccess, Permission } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Проверяем, является ли пользователь администратором
    const adminCheck = await isAdmin(session);
    const hasSettingsAccess = await checkAccess(session, [Permission.SETTINGS_VIEW]);
    
    if (!adminCheck || !hasSettingsAccess) {
      console.log(`[Admin Check] Access denied for ${session.user.email}`);
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: {
        email: session.user.email,
        role: session.user.role,
      }
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 