import { NextResponse, connection } from 'next/server';
import { authState } from '../_identity';

/** GET → {auth: "disabled" | "signed_out" | "signed_in"}. Read-only: tells the chat whether to show sign-in and history. */
export async function GET() {
  await connection(); // per request, never prerendered
  return NextResponse.json({ auth: await authState() }, { headers: { 'Cache-Control': 'no-store' } });
}
