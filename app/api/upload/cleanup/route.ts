import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = 'public/uploads';

export async function POST(request: NextRequest) {
  try {
    const { folder, usedUrls } = await request.json();

    if (!folder || !Array.isArray(usedUrls)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const folderPath = path.join(process.cwd(), UPLOAD_DIR, folder);

    if (!existsSync(folderPath)) {
      return NextResponse.json({ deleted: 0, files: [] });
    }

    const files = await readdir(folderPath);
    const deleted: string[] = [];

    // Convert usedUrls to filenames for comparison
    const usedFilenames = new Set(
      usedUrls.map((url: string) => path.basename(url))
    );

    for (const file of files) {
      if (!usedFilenames.has(file)) {
        const filePath = path.join(folderPath, file);
        const fileStat = await stat(filePath);
        
        // Only delete files, not directories
        if (fileStat.isFile()) {
          await unlink(filePath);
          deleted.push(file);
        }
      }
    }

    return NextResponse.json({
      deleted: deleted.length,
      files: deleted,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
