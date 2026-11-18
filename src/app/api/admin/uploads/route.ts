import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";
import { saveUpload } from "@/lib/db";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG or WebP photo." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Photo is over 5 MB. Try a smaller one." }, { status: 400 });

  const name = `${randomUUID()}.${ext}`;
  await saveUpload(name, file.type, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/uploads/${name}` });
}
