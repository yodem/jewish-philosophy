# Sadik chat — design (round 2)

Scope: the "שאלו את פרופ׳ צדיק" chat panel and the shared-answer page. The rest of the site keeps `client/DESIGN.md`.
Every colour, size and radius in `sadik-chat.css` comes from the tokens below; components use the tokens, never raw values.

## Direction

**"The gloss page" (צורת הדף).** A printed Hebrew book of philosophy puts the argument in the middle of the page and
its glosses (הגהות) in the margin, keyed by Hebrew letters: א, ב, ג. The chat does the same. The answer is set as a
page of text in David, the typeface of Israeli academic print; every `[n]` the model writes becomes a small Hebrew
letter, and the margin beside the paragraph carries the matching gloss: the quotation, the lecture moment, the
article page. On a phone the margin folds under the answer, still keyed by the same letters. The ground is cool
lapis paper (blue-grey, not cream), the accent is verdigris (the green of old bronze and of the copper pigment in
medieval Hebrew illumination), and the primary action is lapis. One moment of motion: while an answer is being
written, three nested celestial spheres (גלגלים, the medieval cosmology Sadik lectures on) turn at different speeds.
Everything else is quiet: no cards, few rules, no gradients.

What a visitor should remember an hour later: "the answer looked like a page from a sefer, and the sources sat in
the margin, lettered א ב ג."

## Tokens

### Colour roles

| Role | Light | Dark | Use |
|---|---|---|---|
| `--sc-ground` | `#E9EDF3` | `#0F1529` | panel background, rail |
| `--sc-sheet` | `#F6F8FB` | `#161E38` | reading surface (answer page, composer, popovers) |
| `--sc-ink` | `#1A2033` | `#E3E7F1` | body text, headings |
| `--sc-ink-2` | `#465069` | `#AEB7CD` | secondary text, gloss source lines |
| `--sc-ink-3` | `#5D6681` | `#8F99B3` | metadata (locators, dates) — ≥ 4.5:1 on sheet and ground |
| `--sc-rule` | `#CBD3E0` | `#2A3558` | the few rules (header foot, margin edge) |
| `--sc-lapis` | `#24398C` | `#A8B9FF` | primary button fill, links, focus ring |
| `--sc-on-lapis` | `#F6F8FB` | `#0F1529` | text on the primary fill |
| `--sc-verdigris` | `#156356` | `#73CDB9` | gloss letters (in text and margin), gloss group names |
| `--sc-leaf` | `#F3E6B8` | `#3A3217` | "gold leaf": the flash on a gloss reached from its letter, active rail item |
| `--sc-alert` | `#9E2530` | `#FF9AA2` | errors |
| `--sc-scrim` | `rgb(15 21 41 / .42)` | `rgb(4 7 16 / .62)` | page dim behind the desktop panel |

Contrast (WCAG, measured on `--sc-sheet` and `--sc-ground`): ink ≥ 14:1, ink-2 ≥ 7:1, ink-3 ≥ 4.6:1, verdigris ≥ 6:1,
lapis ≥ 8:1, on-lapis on lapis ≥ 9:1, in both themes. Colour is never the only signal: gloss groups carry names,
the active rail item has a weight change and a leaf mark, the chosen vote has `aria-pressed` and a filled state.

Dark is designed, not inverted: the ground goes to a deep lapis (not black), the sheet lifts one step, the accents
move to pale lapis and pale verdigris so they glow rather than shout, and the leaf highlight becomes a dim gilt.

### Type

Two families, both with full Hebrew:
- **David Libre** (400, 500, 700) — the voice of the book: answers, questions, quotations, starter questions, the title.
- **Rubik** (400, 500) — the site's UI face, so the panel sits inside the site: controls, labels, gloss source lines, metadata.

Scale, ratio 1.2 from a 17px reading size (answers) and a 14px UI size:

| Token | px | Family / weight | Line height | Use |
|---|---|---|---|---|
| `--sc-t-display` | 29 | David 500 | 1.15 | empty-state heading |
| `--sc-t-question` | 24 | David 700 | 1.2 | the question above an answer |
| `--sc-t-title` | 20 | David 700 | 1.1 | panel title |
| `--sc-t-read` | 17.5 | David 400 | 1.75 | answer body |
| `--sc-t-gloss` | 15 | David 400 | 1.6 | quotations, previews |
| `--sc-t-ui` | 14 | Rubik 400/500 | 1.45 | controls, gloss source lines, rail |
| `--sc-t-meta` | 12.5 | Rubik 400 | 1.4 | locators, dates, group names |

Measure: answer column `max-inline-size: 36em` of the read size (≈ 62-70 Hebrew characters); margin column 15-17em.
Headings tight (1.1-1.2) with `letter-spacing: -0.01em`; no all-caps, no eyebrows (Hebrew has no case anyway).
Inline links are underlined (offset 3px, thickness 1px).

### Space, radii, motion

- Spacing steps: 4 · 8 · 12 · 16 · 24 · 32 · 48 (`--sc-s1`…`--sc-s7`).
- Radii by hierarchy: panel 14px, popovers and composer 10px, buttons 8px, letters and small marks 999px. No single radius on everything.
- Elevation: only the panel (over the site) and popovers have a shadow, tinted with the ground hue, never grey.
- Motion: the spheres while writing (the one ambient motion); panel open 160ms fade+rise; the gloss flash 900ms;
  popovers 120ms. `prefers-reduced-motion: reduce` turns all of them off (spheres become static).

## Component rules

1. **Panel.** Desktop: a centered sheet, `min(1100px, 92vw) × min(86vh, 920px)`, over a scrim; mobile (< 640px): full screen.
   Opens from the site's 💬 button. Esc closes and returns focus to the button.
2. **Header.** Title (David) + a small "בינה מלאכותית" tag; then text-labelled controls: אודות (ⓘ), theme, ייצוא (when there
   is a conversation), שיחה חדשה (anonymous, when there is a conversation), sign-in (only when sign-in is configured), and ✕ (aria-label).
   Narrow widths keep icons but every icon has a visible-on-hover title and an aria-label.
3. **Turn = page + margin.** The question in David 24/700, then the answer page. The answer's `[n]` become verdigris
   Hebrew letters (superscript, a button: click/Enter scrolls to and flashes the gloss). In a container ≥ 760px wide the
   glosses sit in a margin column beside the answer; below that they follow the answer under a short rule.
4. **Glosses.** Three named groups, only when non-empty: ציטוטים (quotation in David, ״…״, then the source line),
   מקורות (letter, kind label, title, locator), להעמקה (no letter: these are not cited in the text). Group names are
   verdigris Rubik 12.5/500. Letters hang in the inline-start gutter, like printed glosses.
5. **Source preview.** Every source/quotation title is a button; hover (fine pointer), keyboard focus or tap opens a
   popover with kind, title, the `snippet`, locator, and "לפתיחת המקור" (the only outbound link, `noopener noreferrer`).
   On narrow panels the popover becomes a sheet at the bottom of the panel. Esc closes it.
6. **Actions under an answer.** 👍 / 👎 (aria-labels, `aria-pressed`) and "שיתוף". Share first shows what becomes public,
   then the link with "העתקת הקישור". Quiet text buttons; nothing competes with the composer.
7. **Composer.** One primary action per view: "שאלו" (lapis fill). A visible label above the field ("השאלה שלכם" /
   "שאלת המשך"); the placeholder is an example, never the label. Enter sends, Shift+Enter breaks a line.
8. **Empty state.** David heading "על מה תרצו לשאול?", one plain sentence on how answers are built, six starter
   questions as a two-column list of David lines on the sheet (one column on mobile).
9. **Quota.** The anonymous daily limit replaces the answer slot with "שאלה אחת ביום ללא התחברות — התחברו כדי להמשיך"
   and, when sign-in is configured, the primary "התחברות עם Google" (the composer is disabled, so this is the one primary action).
10. **Rail (signed-in).** At the inline start, on the ground: "שיחה חדשה", then conversation titles, newest first.
    Active item: leaf mark + weight 500. On mobile the rail is a drawer behind a "שיחות" button.
11. **Info (ⓘ).** A popover: the disclosure sentence (exact text, David 17.5), then "איך נבנות התשובות" in three short lines,
    then what is stored. No disclaimer line elsewhere.
12. **Writing state.** The spheres + "מעיין במקורות…" until the first words arrive; then text streams in place.

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
