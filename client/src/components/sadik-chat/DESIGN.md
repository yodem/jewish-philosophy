# Sadik chat — design (round 2, revision 1)

Scope: the "שאלו את פרופ׳ צדיק" chat panel and the shared-answer page. The rest of the site keeps `client/DESIGN.md`.
Every colour, size and radius in `sadik-chat.css` comes from the tokens below; components use the tokens, never raw values.

## Direction

**"The commentary page" (צורת הדף).** A printed page of Jewish learning sets the main text in square letters in the
middle and its commentaries around it in a smaller, different script (Rashi script), each keyed by Hebrew letters.
The chat is laid out the same way, and that is the one bold idea; everything else stays quiet.

- The answer is the main text: Noto Serif Hebrew at reading size, opening with an enlarged first word (the printed
  page's opening word, תיבה פותחת), its `[n]` markers set as Hebrew letters (א ב ג).
- The sources are the commentary: a column beside the answer set in **Rashi script** (Noto Rashi Hebrew) at a smaller
  size, each gloss opening with its letter and a bold square-letter lemma (the source's name), like a printed gloss.
- The letters are a system: the same letter, colour and weight in the text, the margin, the phone strip, the preview.
- The empty conversation is a blank page: the invitation in the middle, the six starter questions as two flanking
  columns of glosses around it, with the page's vertical rules.
- The anonymous daily limit is a bookplate: a framed slip (double rule) with one action.
- Colour, two materials: light is **verdigris day** (a pale copper-patina binding around a bright page, verdigris
  letters, lapis action); dark is **lapis night** (a lapis binding, a dark page, gilded letters). Lapis, verdigris and
  gold leaf are the pigments of an illuminated Hebrew manuscript. One ambient motion:
  three celestial spheres (גלגלים) turn while an answer is being written.

What a visitor should remember an hour later: "the answer looked like a page of Talmud: the text in the middle,
the sources around it in Rashi script, lettered א ב ג."

## Tokens

### Colour roles

| Role | Light | Dark | Use |
|---|---|---|---|
| `--sc-ground` | `#DCE8E2` (patina) | `#141833` | panel background, rail, the binding around the page |
| `--sc-sheet` | `#FBFCFB` | `#1C2142` | the page (answer, empty page, popovers, composer) |
| `--sc-ink` | `#142320` | `#ECEAF3` | main text, headings |
| `--sc-ink-2` | `#384C46` | `#C3C1D6` | commentary text, source lines, metadata |
| `--sc-rule` | `#B7CCC3` | `#343A66` | page rules (margin edge, header foot, entry rules) |
| `--sc-lapis` | `#24398C` | `#AEBEFF` | primary button, links, focus ring |
| `--sc-on-lapis` | `#FBFCFB` | `#141833` | text on the primary fill |
| `--sc-letter` | `#0E5A4B` (verdigris) | `#E2C77A` (gilt) | gloss letters everywhere, group names, active marks |
| `--sc-letter-wash` | verdigris 12% | gilt 16% | flash on a gloss reached from its letter, hover/press on entries |
| `--sc-alert` | `#9E2530` | `#FF9AA2` | errors |
| `--sc-scrim` | patina 82% + blur | `rgb(4 6 16 / .7)` + blur | behind the desktop panel, sheets and the info popover |

Contrast (WCAG, lowest of `--sc-sheet` / `--sc-ground`, both themes computed): ink ≥ 12.9:1, ink-2 ≥ 7.2:1,
lapis ≥ 8.1:1, letter ≥ 6.4:1 (verdigris) / 9.4:1 (gilt), alert ≥ 6:1, on-lapis ≥ 9.6:1. There is no
third, lighter grey any more: metadata uses ink-2 at a readable size. Colour is never the only signal: groups are
named, the active rail item has a bar and weight, the chosen vote has `aria-pressed` and a fill.

Dark is designed, not inverted: a violet-leaning lapis night (not near-black), the page one step lighter, letters
turn from verdigris to gilt, links to pale lapis.

### Type

Two families, both drawn for Hebrew:
- **Noto Serif Hebrew** (variable, wght 400-800, wdth 87.5-100) — the main text and the interface: answers,
  questions, headings, buttons, source names. Controls and metadata use the narrower width (wdth 87.5).
- **Noto Rashi Hebrew** (400-600) — the commentary voice: quotations, source previews, the snippet text.

Scale, ratio 1.2 from an 18px reading size:

| Token | px | Face / weight | Line height | Use |
|---|---|---|---|---|
| `--sc-t-display` | 31 | Serif 700 | 1.12 | the empty page's invitation |
| `--sc-t-question` | 25 | Serif 700 | 1.18 | the question above an answer |
| `--sc-t-title` | 20 | Serif 700 | 1.1 | panel title, quota slip |
| `--sc-t-read` | 18 | Serif 400 | 1.75 | answer text (opening word 1.6em / 800) |
| `--sc-t-gloss` | 16 | Rashi 400 | 1.7 | quotations, previews |
| `--sc-t-ui` | 15 | Serif 500, wdth 87.5 | 1.45 | controls, source names, rail |
| `--sc-t-meta` | 13.5 | Serif 500, wdth 87.5 | 1.4 | group names, locators, kinds |

Measure: answer column ≤ 34em of the read size (≈ 60-68 characters); commentary column 16-20rem.

### Space, radii, motion

- Spacing steps: 4 · 8 · 12 · 16 · 24 · 32 · 48 (`--sc-s1`…`--sc-s7`).
- Radii by role: panel 14px; popovers and the page 10px; buttons 8px; the quota slip 3px (a printed frame).
- Elevation: only the panel and floating sheets have shadows, tinted with the ground hue.
- Motion: the spheres while writing; panel open 160ms; the gloss flash 900ms; popovers 120ms; all off under
  `prefers-reduced-motion`.

## Component rules

1. **Panel.** Desktop: centered sheet `min(1100px, 92vw) × min(86vh, 920px)` over a scrim; phone (< 640px): full screen.
2. **Header.** Title + "בינה מלאכותית" tag; אודות (ⓘ + word), theme, ייצוא, שיחה חדשה (anonymous), sign-in (configured
   only), ✕. Icon-only controls carry aria-label + title; on a phone theme / export / new go into a worded "עוד" menu.
3. **Turn = page + commentary.** The question, then one page: main text column + commentary column (≥ 860px of
   conversation width), separated by the one vertical rule. Narrower, each paragraph is followed by a **gloss strip**:
   its letters with short source names, tap to unfold the gloss in place (quotation or preview, locator, link);
   "להעמקה" follows the answer.
4. **Glosses.** ציטוטים: letter + lemma (bold source name in square letters) + the quotation in Rashi script + kind and
   locator. מקורות: letter + lemma + kind + locator; the lemma opens the preview. להעמקה: no letter (not cited).
   Group names in the letter colour, 13.5/600.
5. **Source preview.** Click, tap or Enter on the lemma unfolds the preview in place, under its entry, pushing the
   following entries down (never a layer over the list); a "סגירה" button and Esc fold it. Holds kind, name, the
   snippet in Rashi script, locator, "לפתיחת המקור".
6. **Letters.** In the text: superscript buttons in the letter colour, 0.8em/700; click scrolls to, focuses and
   flashes the gloss (or unfolds the phone strip item). The same glyph, colour and weight in every place.
7. **Actions.** 👍 / 👎 (aria-pressed) and "שיתוף" (preview of what becomes public, then the link).
8. **Composer.** The send button is always a filled primary (empty input just refocuses the field). Under the quota
   the field is replaced by a sentence; the slip's button is the one action.
9. **Empty page.** The invitation (display size), one sentence and "בחרו שאלה או כתבו משלכם" in the middle column; six
   starters as two flanking columns of ruled entries: a leading letter (א-ו), topic, question, and ← at the end; hover
   and press wash the entry in the letter colour. On a phone: compact entries that fit above the composer.
10. **Quota slip.** A framed bookplate (double rule in the letter colour, 3px radius) centred on the page: the
    required sentence at title size, one supporting line, and "התחברות עם Google" when sign-in is configured.
11. **Rail = the book's index (מפתח).** "שיחה חדשה", then "מפתח השיחות": each entry a ruled index line with its letter,
    the title (up to two lines) and the date set like a page number at the line's end. Active = letter-colour bar,
    weight 600, the page colour behind it. Phone: a full-width drawer with its own close button.
12. **Info (ⓘ).** Desktop popover inside the panel; phone: a bottom sheet with a close button. The disclosure as a
    heading (exact text), then "איך נבנות התשובות" and "מה נשמר" in 15px ink.

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
