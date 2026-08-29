import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export async function POST(req: Request) {
  try {
    console.log("=== API /upload HIT ===");
    const formData = await req.formData();
    const file = formData.get("file") as File;
    console.log("FormData parsed, file found:", file ? file.name : "null");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }


    const bytes = await file.arrayBuffer();
    console.log("ArrayBuffer extracted, size:", bytes.byteLength);
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64Data}`;

    console.log("Uploading to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "teamconnect",
      resource_type: "auto",
    });
    console.log("Cloudinary upload successful, secure_url:", (uploadResult as any).secure_url);

    return NextResponse.json({ url: (uploadResult as any).secure_url }, { status: 200 });
  } catch (error) {
    console.error("Upload error caught:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
