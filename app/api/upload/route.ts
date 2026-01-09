import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = 'public/uploads';
const WEBP_QUALITY = 85;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'image';
}

function generateFilename(originalName: string, folder: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const slugified = slugify(nameWithoutExt);
  const timestamp = Date.now();
  return `${folder}/${slugified}-${timestamp}.webp`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'settings';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process with Sharp - convert to WebP with 85% quality
    const processedBuffer = await sharp(buffer)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Get metadata for dimensions
    const metadata = await sharp(processedBuffer).metadata();

    // Generate filename
    const filename = generateFilename(file.name, folder);
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, filename);
    const uploadDir = path.dirname(uploadPath);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    await writeFile(uploadPath, processedBuffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      width: metadata.width,
      height: metadata.height,
      size: processedBuffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
