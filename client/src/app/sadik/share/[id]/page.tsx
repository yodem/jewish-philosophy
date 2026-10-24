import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { rubik } from '@/lib/fonts';
import { SHARE_ID_RE, bridgeConfig, bridgeFetch } from '@/app/api/sadik-chat/_bridge';
import { AnswerText, Glosses } from '@/components/sadik-chat/Answer';
import { davidLibre } from '@/components/sadik-chat/fonts';
import { parseSharedAnswer } from '@/components/sadik-chat/validate';
import '@/components/sadik-chat/sadik-chat.css';

/**
 * A shared answer: read-only question, answer and glosses, fetched per request from the bridge (bearer, never cached,
 * so a revoked share disappears at once). noindex here and in the X-Robots-Tag header (next.config.ts).
 */
export const metadata: Metadata = {
  title: 'תשובה משותפת',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
};

const DISCLOSURE = 'בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק — לא פרופ׳ צדיק עצמו';

async function SharedAnswerView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!SHARE_ID_RE.test(id)) notFound();
  const config = bridgeConfig();
  if (!config) notFound();
  let data: unknown = null;
  try {
    const res = await bridgeFetch(config, `/share/${encodeURIComponent(id)}`, { method: 'GET' });
    if (res.ok) data = await res.json();
  } catch {
    data = null;
  }
  const shared = parseSharedAnswer(data);
  if (!shared) notFound();
  const prefix = 'shared';
  const hasGlosses = shared.citations.length > 0 || shared.further_reading.length > 0;
  return (
    <main className={`sc sc-sharepage ${rubik.variable} ${davidLibre.variable}`} dir="rtl" lang="he" data-shared-answer>
      <div className="sc-sharepage-inner">
        <header className="sc-sharepage-head">
          <span className="sc-title">שאלו את פרופ׳ צדיק</span>
          <span className="sc-ai-tag">{DISCLOSURE}</span>
        </header>
        <article className="sc-turn">
          <h1 className="sc-question">{shared.question}</h1>
          <div className="sc-leaf">
            <div className="sc-page">
              <AnswerText text={shared.text} prefix={prefix} citations={shared.citations} />
            </div>
            {hasGlosses && (
              <aside className="sc-margin" aria-label="ציטוטים ומקורות">
                <Glosses citations={shared.citations} further={shared.further_reading} prefix={prefix} />
              </aside>
            )}
          </div>
        </article>
        <p className="sc-sharepage-note">התשובה נכתבה בידי מערכת בינה מלאכותית. אפשר לשאול שאלות משלכם מכפתור הצ׳אט בפינת העמוד.</p>
      </div>
    </main>
  );
}

export default function SharedAnswerPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <SharedAnswerView params={params} />
    </Suspense>
  );
}
