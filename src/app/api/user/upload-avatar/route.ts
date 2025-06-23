import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prismaDb";
import { checkAccess, Permission } from "@/lib/auth-helpers";
import { AuditLogService } from "@/lib/services/audit-log.service";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to change avatar
    const hasPermission = await checkAccess(session, [Permission.USER_UPDATE]);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      );
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.telesklad_user.findUnique({
      where: { email: session.user.email }
    });

    // Delete old avatar from S3 if exists
    if (currentUser?.image && currentUser.image.includes(process.env.S3_ENDPOINT || 's3.ru1.storage.beget.cloud')) {
      try {
        await deleteFromS3(currentUser.image);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
        // Continue with upload even if delete fails
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const avatarUrl = await uploadToS3(
      buffer,
      file.name,
      file.type,
      'avatars' // Use avatars folder instead of products
    );

    // Update user with new avatar URL
    await prisma.telesklad_user.update({
      where: { email: session.user.email },
      data: { image: avatarUrl }
    });

    // Log the action
    await AuditLogService.log({
      userId: session.user.email,
      action: 'AVATAR_UPLOAD',
      resource: 'user',
      resourceId: currentUser?.id,
      details: { 
        fileName: file.name,
        fileSize: file.size,
        avatarUrl 
      }
    });

    return NextResponse.json({ 
      success: true,
      avatarUrl 
    });

  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
} 