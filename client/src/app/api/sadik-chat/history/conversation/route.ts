import { NextResponse, type NextRequest } from 'next/server';
import { CONVERSATION_ID_RE } from '../../_bridge';
import { forwardHistory, historyRequest } from '../_history';

/** POST {conversation_id} → that conversation's turns, if it belongs to the signed-in user (bridge enforces it). */
export async function POST(request: NextRequest) {
  const r = await historyRequest(request);
  if (r.rejection) return r.rejection;
  const cid = r.body.conversation_id;
  if (typeof cid !== 'string' || !CONVERSATION_ID_RE.test(cid)) return r.reply(NextResponse.json({ error: 'invalid conversation' }, { status: 400 }));
  return forwardHistory('/history/conversation', { user: { kind: 'google', id: r.uid }, conversation_id: cid }, r.reply, request.signal);
}
