import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    email: payload.email,
    phone: payload.phone ?? null,
    authProvider: payload.authProvider ?? "magic_link",
    magicLink: `https://portal.local/magic/${encodeURIComponent(payload.email)}`,
    createdAt: new Date().toISOString(),
  });
}
