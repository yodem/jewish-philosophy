import type { NextRequest } from 'next/server';
import { forwardHistory, historyRequest } from './_history';

/** POST {} → the signed-in user's conversations (bridge POST /history/conversations {user}). */
export async function POST(request: NextRequest) {
  const r = await historyRequest(request);
  if (r.rejection) return r.rejection;
  return forwardHistory('/history/conversations', { user: { kind: 'google', id: r.uid } }, r.reply, request.signal);
}
