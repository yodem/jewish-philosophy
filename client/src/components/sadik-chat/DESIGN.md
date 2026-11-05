# Sadik chat — design (round 2, site design system)

Scope: the "שאלו את פרופ׳ צדיק" chat panel and the shared-answer page.

**Source of truth: the site's Stitch design system**, project "שלום צדיק - Refactored Frontend (Clean)" (Yotam,
2026-10-24): `design-system.json` and the Responsa-detail, Home, Blog, Responsa-listing and Video screens. The chat
must look like a native part of the site. This file only maps that system onto the chat; where they differ, Stitch
wins. Every colour, size and radius in `sadik-chat.css` is a token below.

## Tokens (from Stitch)

| Role | Light | Dark (class-based, blue-tinted slate) |
|---|---|---|
| Header | navy `#1e3a8a`, white text, blue-200 icons | slate-950 `#020617` |
| Panel ground | gradient `#eff6ff → #dbeafe` (135°) | slate-900 `#0f172a` → `#0b1222` |
| Cards | white, 1px blue-100 / slate-100 borders, soft shadow | slate-800 `#1e293b`, slate-700 borders |
| Text | slate-900 headings, slate-800 body, slate-700 secondary, slate-500 meta | slate-50 / 200 / 300 / 400 |
| Primary action | blue-600 `#2563eb`, hover blue-700, white bold text, shadow-md | blue-500 / blue-400 |
| Soft action / marker | blue-50 / blue-100 with blue-900 text | blue-900/30, blue-200 text |
| Content-type pills | video `#2563eb`, series `#8b5cf6`, blog `#22c55e`, responsa `#f97316`, writings `#14b8a6`, term `#ec4899` as soft pills (100 background, 700 text) | the same hues at 15-20% with 300 text |

- Font: **Rubik only** (the site's `--font-rubik`). Type scale 12-14-16-18-20-24-30.
- Spacing 4-8-12-16-24-32-48. Radius 8px for inputs, buttons and inner boxes; 12px cards (rounded-xl in the
  Stitch screens); full for pills and badges.
- Contrast (computed): all text pairs ≥ 4.5:1 (slate-500 on white 4.76:1; pill 700-on-100 pairs 4.52-5.98:1; white on blue-600 5.17:1).

## Components (mapped from the Stitch screens)

1. **Panel.** Desktop: a centred sheet `min(1100px, 92vw) × min(86vh, 920px)` over a blurred slate scrim; phone: full
   screen. Header = the site's navy bar: title, "בינה מלאכותית" pill, אודות, theme, export, new conversation, white
   "התחברות עם Google" button (configured only), close. Phone: theme / export / new in an "עוד" menu.
2. **Question** as an extrabold 24px heading (the responsa question title).
3. **Answer card** = the responsa page's official answer card: white card, 4px blue-600 inline-start border, identity
   row (round avatar with a shield icon, bold name "מתוך כתביו של פרופ׳ צדיק", blue "בינה מלאכותית" badge, slate-500
   meta line), then the answer at 16px / 1.75. `[n]` markers are small blue-100 number pills (buttons) that scroll to
   and highlight their source.
4. **Sources** inside the same card under a rule: "ציטוטים", "מקורות", "להעמקה" headings (bold, blue icon); each entry a
   quiet bordered row: number pill, the quotation (blue-50 box) when there is one, the content-type pill, the source
   name (underlined button) and the locator. The name unfolds the preview **in place** (snippet, "לפתיחת המקור", close
   button, Esc). No floating layers over the list.
5. **Actions** under a rule: 👍 / 👎 icon buttons (aria-pressed) and "שיתוף" (preview of what becomes public, then the
   link with "העתקת הקישור").
6. **Composer** = the site's form: label, bordered 8px textarea with blue focus ring, blue-600 "שליחה" button with a
   send icon. Under the anonymous quota the field is replaced by a sentence.
7. **Empty conversation**: an icon tile + "על מה תרצו לשאול?" + one sentence; "שאלות לדוגמה" with the site's section
   underline; six white cards (topic as a content-type pill, bold question, arrow-back icon), hover lifts the shadow.
8. **Quota card** = the Video page's sidebar card: orange icon tile (lock), title (the required sentence), one line,
   full-width blue "התחברות עם Google", and a slate-50 "שימו לב" note box.
9. **Rail** (signed-in) = a white side card: "שיחה חדשה" soft button, "השיחות שלכם", an index of conversations
   (number, title up to two lines, date at the end); active row blue-50 with a blue-600 inline-start bar. Phone: a
   full-width drawer with a close button.
10. **Info (ⓘ)**: a white popover (phone: bottom sheet) with the exact disclosure, "איך נבנות התשובות" (including
    "הפניות למקורות מקושרות לספריא"), "מה נשמר". It dims what is behind it.
11. **Writing state**: three pulsing blue dots + "מחפש במקורות…" inside the answer card.
12. **Sefaria Linker v3**: loaded (next/script, afterInteractive) only while the panel is open; called once per final
    answer with `whitelistSelector` = that answer card and our own controls/links excluded. The finished answer is a
    memoised component so React never re-renders the text the linker rewrote.

## Decision log

- 2026-10-24 · Rejected the mockup's cream ground + Frank Ruhl + sepia: that is the "cream + serif + rust" generic cluster
  (specificity test). Kept only the functional skeleton. → cool lapis paper ground, verdigris accent.
- 2026-10-24 · Layout from the subject, not from chat apps: glosses in the margin (צורת הדף) instead of chips under the
  answer; Hebrew-letter markers instead of [1]. Rules: frontend-design "ground the design in the subject matter";
  specificity "borrow the skeleton, not the clothes".
- 2026-10-24 · Two families only (UI/UX ch4): David Libre for the voice, Rubik for UI because the site already loads it
  and it ties the panel to the site. Frank Ruhl is out (mockup clothes).
- 2026-10-24 · Starters and sources are lists, not cards (anti SaaS-card kit, "border overload" ch15). The margin edge is
  the only vertical rule.
- 2026-10-24 · One primary action per view (ch3): send in the composer, or sign-in when the quota blocks sending.
- 2026-10-24 · Dark theme follows the site's `.dark` class (the site resolves it from prefers-color-scheme + its toggle);
  the panel's own toggle flips the same setting, so the site and chat never disagree.
- 2026-10-24 · Kind labels as words (הרצאה, מאמר, שו״ת, בלוג…) instead of 📄/💬 emoji: emoji render in system colour and
  break the palette; ▶ stays on time locators because it says "play from here".
- 2026-10-24 · Starter cards → an index list (topic + question): the first screenshots read as the SaaS-card kit.
- 2026-10-24 · The answer and its margin became one sheet: separate card + floating margin did not read as one page.
  Margin breakpoint raised from 760 to 860px after the rail screenshot showed a cramped 170px margin.
- 2026-10-24 · Phone header: overflow "עוד" menu after the 375px screenshot showed the title colliding with the tools.
- 2026-10-24 · Revision 1 after the blind judge (mean 5.3; answer 6, empty 7, info 4, preview 5, quota 5, rail 5):
  - "generic navy chat", "one clean sans": David Libre read as a sans at chat sizes. → Noto Serif Hebrew for the main
    text and UI, Noto Rashi Hebrew for the commentary, so the page/commentary contrast is visible at a glance
    (specificity: borrow the subject's vernacular, not chat-app clothes). Rubik leaves the panel (two faces max).
  - "navy + mint = generic dark cluster" → dark letters turn gilt on a violet-leaning lapis night (lapis + gold leaf).
  - "tiny low-contrast metadata" → ink-3 removed; metadata is ink-2 at 13.5px; source names 15px.
  - "sources below the fold on mobile" → gloss strips under each paragraph, unfolding in place.
  - Info clipped at 375 → bottom sheet on phones. Preview clipped by the footer → flip/limit inside the conversation area.
  - Empty "stock suggestion screen" → the starters flank the invitation like commentaries on a page.
  - Quota "generic card" → a bookplate slip; the composer shows a sentence instead of a dead field.
  - Rail titles truncated → two lines; active mark in the letter colour instead of a gold wash; drawer close button.
- 2026-10-24 · Revision 2 after the second judge (mean 5.8; answer 6, empty 5, info 6, preview 5, quota 7, rail 6):
  - Starters did not read as tappable → ruled entries with a leading letter, hover/press wash and ←; compact on phones
    so all six fit above the composer.
  - Preview covered its own list → it now unfolds in place under the entry with a close button; it no longer opens on
    hover or focus (an in-place unfold on hover would make the list jump). Ruling recorded in the report.
  - Navy "outline" around the light modal = the site's navy hero showing at the panel's sides → a light, blurred
    patina scrim in light mode (and blur in dark) so nothing hard-edged shows behind the panel.
  - Light theme "flat grey-blue" → its own material: verdigris day (patina binding, bright page), not an inversion of
    the lapis night; specificity checked (no cream, no rust).
  - Rail "standard sidebar" → an index (מפתח) with letters and dates.
  - Also: the info popover dims what is behind it; quota sentence balanced; letters larger on phones.
- 2026-10-24 · **Direction change (Yotam, binding):** the chat follows the site's Stitch design system exactly; the
  specificity-test direction and the Talmud-page clothes (Noto Serif + Rashi script, margin column, Hebrew-letter
  markers, patina/lapis materials) are dropped. No Rashi script anywhere. Kept: numbered markers linking to sources,
  in-place preview, index-style conversation list, a card for the quota. Added the Sefaria linker.
