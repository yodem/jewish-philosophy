import { NextResponse, connection, type NextRequest } from 'next/server';
import { authState } from '../_identity';

/** GET → {auth: "disabled" | "signed_out" | "signed_in"}. Read-only: tells the chat whether to show sign-in and history. */
export async function GET(request: NextRequest) {
  await connection(); // per request, never prerendered
  return NextResponse.json({ auth: await authState(request) }, { headers: { 'Cache-Control': 'no-store' } });
}
