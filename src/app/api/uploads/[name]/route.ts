import { getUpload } from "@/lib/db";

// Serves product photos uploaded from the team dashboard (stored in Postgres).
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  const file = await getUpload(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
