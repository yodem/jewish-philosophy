"use client";

import { useState } from 'react';
import { Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { track } from './analytics';
import { AnswerText, Glosses } from './Answer';
import type { AuthState, BotMessage, Vote } from './types';
import type { ShareResult } from './useSadikChat';

/** One question and its answer page with the margin of glosses; actions under the answer. */

export function Spheres() {
  // Three nested celestial spheres (גלגלים), each body on its own orbit and speed.
  return (
    <svg className="sc-spheres" viewBox="0 0 34 34" aria-hidden>
      <circle className="sc-orbit" cx="17" cy="17" r="6" />
      <circle className="sc-orbit" cx="17" cy="17" r="11" />
      <circle className="sc-orbit" cx="17" cy="17" r="16" />
      <circle className="sc-body" cx="17" cy="17" r="2" />
      <g>
        <circle className="sc-body" cx="17" cy="11" r="1.8" />
      </g>
      <g>
        <circle className="sc-body" cx="28" cy="17" r="1.6" />
      </g>
      <g>
        <circle className="sc-body" cx="17" cy="33" r="1.4" />
      </g>
    </svg>
  );
}

const THUMBS: { value: Vote; label: string; Icon: typeof ThumbsUp }[] = [
  { value: 'up', label: 'תשובה טובה', Icon: ThumbsUp },
  { value: 'down', label: 'תשובה לא טובה', Icon: ThumbsDown },
];

function ShareControl({ onShare }: { onShare: () => Promise<ShareResult> }) {
  const [stage, setStage] = useState<'closed' | 'confirm' | 'working' | 'done' | 'failed'>('closed');
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (stage === 'closed') {
    return (
      <button type="button" className="sc-btn" onClick={() => setStage('confirm')} aria-expanded={false}>
        <Share2 aria-hidden />
        שיתוף
      </button>
    );
  }
  return (
    <div className="sc-share" role="group" aria-label="שיתוף התשובה" data-share>
      {stage === 'done' ? (
        <>
          <p>כל מי שיקבל את הקישור יראה את השאלה, התשובה והמקורות.</p>
          <div className="sc-share-row">
            <input readOnly value={url} aria-label="קישור לתשובה" onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              className="sc-btn sc-btn--outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  track('share', { stage: 'copy' });
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? 'הקישור הועתק' : 'העתקת הקישור'}
            </button>
            <button type="button" className="sc-btn" onClick={() => setStage('closed')}>
              סגירה
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            {stage === 'failed'
              ? 'לא הצלחנו ליצור קישור. נסו שוב בעוד רגע.'
              : 'הקישור יציג את השאלה הזאת, את התשובה ואת המקורות שלה. שאר השיחה ופרטים מזהים לא ייכללו בו.'}
          </p>
          <div className="sc-share-row">
            <button
              type="button"
              className="sc-btn sc-btn--outline"
              disabled={stage === 'working'}
              onClick={async () => {
                setStage('working');
                const res = await onShare();
                if (res.ok) {
                  setUrl(res.url);
                  setStage('done');
                } else {
                  setStage('failed');
                }
              }}
            >
              יצירת קישור
            </button>
            <button type="button" className="sc-btn" onClick={() => setStage('closed')}>
              ביטול
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Turn({
  question,
  answer,
  prefix,
  pending,
  auth,
  onVote,
  onShare,
  onSignIn,
}: {
  question: string;
  answer?: BotMessage;
  prefix: string;
  pending: boolean;
  auth: AuthState;
  onVote: (value: Vote) => void;
  onShare: () => Promise<ShareResult>;
  onSignIn: () => void;
}) {
  const further = answer?.further_reading ?? [];
  const writing = pending && !answer?.text;
  return (
    <article className="sc-turn" data-turn>
      <h3 className="sc-question" data-question>
        {question}
      </h3>
      {answer?.quota ? (
        <div className="sc-slip-wrap" data-quota>
          <div className="sc-slip" role="status">
            <span className="sc-slip-mark sc-letter" aria-hidden>
              א
            </span>
            <p className="sc-slip-text">{answer.text}</p>
            {auth === 'signed_out' ? (
              <>
                <p className="sc-slip-sub">אחרי ההתחברות אפשר להמשיך לשאול, והשיחות נשמרות כדי שתוכלו לחזור אליהן.</p>
                <button type="button" className="sc-btn sc-btn--primary" onClick={onSignIn}>
                  התחברות עם Google
                </button>
              </>
            ) : (
              <p className="sc-slip-sub">אפשר לשאול שוב מחר.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="sc-leaf">
          <div className="sc-page" data-page>
            {writing ? (
              <div className="sc-writing" role="status">
                <Spheres />
                מעיין במקורות…
              </div>
            ) : answer?.error ? (
              <p role="alert" className="sc-error">
                {answer.text}
              </p>
            ) : answer ? (
              <AnswerText text={answer.text} prefix={prefix} citations={answer.citations} />
            ) : null}
            {answer?.turn_id && !answer.error && !pending && (
              <div className="sc-actions">
                {THUMBS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className="sc-btn sc-btn--icon sc-vote"
                    aria-label={label}
                    title={label}
                    aria-pressed={answer.vote === value}
                    disabled={answer.vote !== undefined}
                    onClick={() => onVote(value)}
                  >
                    <Icon aria-hidden />
                  </button>
                ))}
                <ShareControl onShare={onShare} />
              </div>
            )}
          </div>
          {answer && !answer.error && !writing && (answer.citations.length > 0 || further.length > 0) && (
            <aside className="sc-margin" aria-label="ציטוטים ומקורות">
              <Glosses citations={answer.citations} further={further} prefix={prefix} />
            </aside>
          )}
        </div>
      )}
    </article>
  );
}
