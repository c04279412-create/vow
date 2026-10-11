import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const singleFile = formData.get('file');

    const fileList = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (fileList.length === 0) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const uploadedUrls = [];

    for (const file of fileList) {
      // Check if Cloudinary credentials exist
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        // Upload to Cloudinary via REST API
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;
        
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uploadForm = new FormData();
        uploadForm.append('file', base64Data);
        uploadForm.append('api_key', apiKey);
        uploadForm.append('timestamp', timestamp.toString());
        uploadForm.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'vowcrafts_preset');

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadForm,
        });
        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          uploadedUrls.push(cloudData.secure_url);
          continue;
        }
      }

      // Check if AWS S3 configuration exists
      const s3Bucket = process.env.AWS_S3_BUCKET;
      const s3Region = process.env.AWS_REGION;
      if (s3Bucket && s3Region) {
        // Direct S3 reference or placeholder URL structure
        const fileName = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        uploadedUrls.push(`https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${fileName}`);
        continue;
      }

      // Save to public/uploads directory for lightning-fast performance
      try {
        const fs = await import('fs');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = file.name ? path.extname(file.name) || '.jpg' : '.jpg';
        const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(uploadDir, safeName);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.promises.writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${safeName}`);
      } catch (writeErr) {
        // Fallback to data URL only if filesystem write fails
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        uploadedUrls.push(dataUrl);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
