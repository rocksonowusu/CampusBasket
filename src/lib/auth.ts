import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cb_admin";

function passcode() {
  return process.env.ADMIN_PASSCODE || "change-me";
}

export function adminToken() {
  return createHash("sha256").update(`campus-basket:${passcode()}`).digest("hex");
}

export function checkPasscode(input: string) {
  return input === passcode();
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === adminToken();
}
