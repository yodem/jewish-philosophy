"use client";

import { useEffect, useState } from 'react';
import { Lock, Share2, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { track } from './analytics';
import { AnswerText, FinalAnswer } from './Answer';
import { linkAnswer } from './sefaria';
import type { AuthState, BotMessage, FurtherReading, Vote } from './types';
import type { ShareResult } from './useSadikChat';

/** One question and its answer card (the site's "official answer" card) with sources and actions. */

const NO_FURTHER: FurtherReading[] = [];

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
    <div className="sc-share" role="group" aria-label="שיתוף התשובה" data-share style={{ flexBasis: '100%' }}>
      {stage === 'done' ? (
        <>
          <p>כל מי שיקבל את הקישור יראה את השאלה, התשובה והמקורות.</p>
          <div className="sc-share-row">
            <input
              readOnly
              value={url}
              aria-label="קישור לתשובה"
              onFocus={(e) => e.currentTarget.select()}
              className="sc-share-input"
              style={{ flex: '1 1 14rem', minWidth: 0, minHeight: 40, padding: '0 12px', border: '1px solid var(--sc-border)', borderRadius: 8, background: 'var(--sc-card)', color: 'var(--sc-text-strong)', font: 'inherit', direction: 'ltr', textAlign: 'left' }}
            />
            <button
              type="button"
              className="sc-btn sc-btn--soft"
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
              className="sc-btn sc-btn--soft"
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

/** The identity row of the answer card, like "צוות האתר" + "מאומת" on a responsa page. */
export function AgentIdentity() {
  return (
    <div className="sc-who">
      <span className="sc-who-avatar" aria-hidden>
        <ShieldCheck />
      </span>
      <div>
        <div className="sc-who-name">
          מתוך כתביו של פרופ׳ צדיק
          <span className="sc-badge">בינה מלאכותית</span>
        </div>
        <div className="sc-who-meta">תשובה שנבנתה מהרצאות, מאמרים ותשובות באתר</div>
      </div>
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
  const writing = pending && !answer?.text;
  const final = !!answer && !pending && !answer.error && !answer.quota && !!answer.text;
  const cardId = `${prefix}-answer`;

  // Sefaria linker: once per finished answer, never while it streams.
  useEffect(() => {
    if (final) linkAnswer(`#${cardId}`);
  }, [final, cardId]);

  return (
    <article className="sc-turn" data-turn>
      <h3 className="sc-question" data-question>
        {question}
      </h3>
      {answer?.quota ? (
        <div className="sc-card sc-quota" data-quota>
          <div className="sc-quota-head">
            <span className="sc-quota-icon" aria-hidden>
              <Lock />
            </span>
            <p className="sc-quota-title" role="status">
              {answer.text}
            </p>
          </div>
          {auth === 'signed_out' ? (
            <>
              <p className="sc-quota-sub">אחרי ההתחברות אפשר להמשיך לשאול, והשיחות נשמרות כדי שתוכלו לחזור אליהן.</p>
              <button type="button" className="sc-btn sc-btn--primary" onClick={onSignIn}>
                התחברות עם Google
              </button>
            </>
          ) : (
            <p className="sc-quota-sub" style={{ marginBottom: 0 }}>
              אפשר לשאול שוב מחר.
            </p>
          )}
          <div className="sc-note">
            <strong>שימו לב:</strong>
            מכסת השאלות ללא התחברות מתאפסת בכל יום. התשובות והמקורות שכבר קיבלתם נשארים כאן.
          </div>
        </div>
      ) : (
        <div className="sc-card sc-answer-card" id={cardId} data-page>
          <AgentIdentity />
          {writing ? (
            <div className="sc-writing" role="status">
              <span className="sc-dots" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              מחפש במקורות…
            </div>
          ) : answer?.error ? (
            <p role="alert" className="sc-error">
              {answer.text}
            </p>
          ) : answer && final ? (
            <FinalAnswer text={answer.text} citations={answer.citations} further={answer.further_reading ?? NO_FURTHER} prefix={prefix} />
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
      )}
    </article>
  );
}
