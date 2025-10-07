import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'qr', 'avatar', etc.

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const filename = `${timestamp}-${randomString}${fileExtension}`;

    // Determine upload directory based on type
    const uploadType = type || 'general';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadType);
    
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Return API URL (dynamic route) instead of static public path
    // This ensures the file is served through our API route which handles MIME types correctly
    const publicUrl = `/api/uploads/${uploadType}/${filename}`;

    console.log('[UPLOAD] File uploaded successfully:', {
      originalName: file.name,
      filename,
      size: file.size,
      type: file.type,
      publicUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error('[UPLOAD] Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET request to check upload endpoint status
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Upload endpoint is ready',
    supportedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: '5MB',
  });
}
