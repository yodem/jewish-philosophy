// Illustrative mock data for the Sadik chat e2e tests and design screenshots (not real corpus output; the quotes
// attributed to Sadik's articles and lectures are placeholders).

export const QUESTION = 'איך מתיישבות ידיעת האל ובחירתו החופשית של האדם?';

export const ANSWER_TEXT = [
  'הרמב״ם קובע כעיקרון שאין לוותר עליו שהאדם בוחר בחירה חופשית: רשות כל אדם נתונה לו[1], ובלעדיה אין טעם לציווי ולאזהרה שבתורה[2]. מנגד, הוא מחזיק בכך שהאל יודע את כל העתיד להתרחש, ולכן נשאלת השאלה כיצד ידיעה מוקדמת אינה מכריעה את הבחירה.',
  'תשובתו של הרמב״ם היא שידיעת האל איננה ידיעה מן הסוג המוכר לנו. ידיעתנו נוספת עלינו ותלויה במושא הנודע, ואילו ידיעת האל היא עצמותו, ולכן אין לנו מושג ממנה[3]. מכאן שהסתירה נובעת מהשוואה פסולה בין שני סוגי ידיעה, ולא מן המציאות עצמה[4]. פרופ׳ צדיק מדגיש שזהו פתרון שלילי במובהק: הרמב״ם אינו מסביר כיצד מתיישבות השתיים, אלא מראה מדוע אין בכוחנו להסביר זאת[5].',
  'רבי חסדאי קרשקש דחה פתרון זה. לדעתו, ידיעה שאין לנו מושג ממנה אינה מיישבת דבר, ולכן הסיק שהמעשים הכרחיים מצד סיבותיהם ואפשריים מצד עצמם[6]. בכך ויתר קרשקש על הבחירה במובנה החזק, אך שמר על האחריות המוסרית[7].',
  'המסקנה היא שהשאלה אינה פתורה במסורת הפילוסופית היהודית, אלא מסמנת את הגבול שבין מה שהשכל יכול להשיג לבין מה שאינו יכול.',
].join('\n\n');

const base = { chunk_id: '', speaker: 'sadik', quote: null, locator_label: null, kind: 'reference' };

export const CITATIONS = [
  {
    ...base,
    n: 1,
    chunk_id: 'primary:mt-teshuva:5#1',
    title: 'משנה תורה, הלכות תשובה ה, א',
    url: 'https://www.sefaria.org/Mishneh_Torah,_Repentance.5.1',
    source_type: 'primary',
    speaker: 'maimonides',
    kind: 'quote',
    quote: 'רשות כל אדם נתונה לו, אם רצה להטות עצמו לדרך טובה ולהיות צדיק — הרשות בידו',
    snippet: 'רשות כל אדם נתונה לו, אם רצה להטות עצמו לדרך טובה ולהיות צדיק — הרשות בידו; ואם רצה להטות עצמו לדרך רעה ולהיות רשע — הרשות בידו…',
  },
  {
    ...base,
    n: 2,
    chunk_id: 'primary:mt-teshuva:5#4',
    title: 'משנה תורה, הלכות תשובה ה, ד',
    url: 'https://www.sefaria.org/Mishneh_Torah,_Repentance.5.4',
    source_type: 'primary',
    speaker: 'maimonides',
    kind: 'quote',
    quote: 'אילו האל היה גוזר על האדם להיות צדיק או רשע… במה היה מצווה על ידי הנביאים עשה כך ואל תעשה כך',
    snippet: '…אילו האל היה גוזר על האדם להיות צדיק או רשע, או אילו היה שם דבר שמושך את האדם בעיקר תולדתו לדרך מן הדרכים… במה היה מצווה על ידי הנביאים עשה כך ואל תעשה כך…',
  },
  {
    ...base,
    n: 3,
    chunk_id: 'academic:knowledge-choice#7',
    title: 'ידיעת האל והבחירה החופשית אצל הרמב״ם',
    url: 'https://example.org/sadik/knowledge-and-choice.pdf#page=7',
    source_type: 'academic',
    kind: 'quote',
    locator_label: 'עמ׳ 7',
    quote: 'ידיעת האל אינה תכונה הנוספת על עצמותו, ולכן כל היקש מידיעתנו אליה מוליך שולל',
    snippet: '…ידיעת האל אינה תכונה הנוספת על עצמותו, ולכן כל היקש מידיעתנו אליה מוליך שולל. הרמב״ם אינו פותר את הסתירה אלא מעתיק אותה אל תחום שבו מושגינו אינם חלים…',
  },
  {
    ...base,
    n: 4,
    chunk_id: 'video:knowledge-3#12',
    title: 'ידיעה ובחירה בהגות היהודית, שיעור 3',
    url: 'https://www.youtube.com/watch?v=abc123&t=314',
    source_type: 'video',
    locator_label: '05:14',
    snippet: 'בשיעור הזה אנחנו עוברים מהשאלה עצמה אל הפתרון של הרמב״ם: שתי ידיעות שאין ביניהן אלא שיתוף השם…',
  },
  {
    ...base,
    n: 5,
    chunk_id: 'responsa:knowledge#2',
    title: 'האם ידיעת ה׳ סותרת את הבחירה?',
    url: '/responsa/knowledge-and-choice',
    source_type: 'responsa',
    snippet: 'השואל מבקש להבין אם יש פתרון חיובי לשאלה. התשובה: אצל הרמב״ם הפתרון שלילי, והוא מכוון כך…',
  },
  {
    ...base,
    n: 6,
    chunk_id: 'academic:crescas#12',
    title: 'קרשקש ושאלת ההכרח',
    url: 'https://example.org/sadik/crescas.pdf#page=12',
    source_type: 'academic',
    locator_label: 'עמ׳ 12',
    snippet: 'לפי קרשקש, המעשה אפשרי מצד עצמו והכרחי מצד סיבותיו. ההבחנה הזאת מאפשרת לו לשמור על השכר והעונש…',
  },
  {
    ...base,
    n: 7,
    chunk_id: 'blog:crescas-responsibility#1',
    title: 'האחריות המוסרית אצל קרשקש',
    url: '/blog/crescas-responsibility',
    source_type: 'blog',
    snippet: '',
  },
];

export const FURTHER_READING = [
  {
    title: 'דיבייט עם הרב מיכאל אברהם על בחירה חופשית',
    url: 'https://www.youtube.com/watch?v=def456&t=4276',
    locator_label: '1:11:16',
    source_type: 'video',
    snippet: 'הוויכוח נסוב על השאלה אם הבחירה החופשית ניתנת להוכחה, או שהיא הנחת יסוד של כל דיון מוסרי…',
  },
  {
    title: 'בחירה ודטרמיניזם מדעי',
    url: '/responsa/choice-and-determinism',
    locator_label: null,
    source_type: 'responsa',
    snippet: 'האם ממצאי מדעי המוח מבטלים את הבחירה? התשובה מבחינה בין תיאור סיבתי לבין שיפוט מוסרי…',
  },
  {
    title: 'מבוא לפילוסופיה דתית, פרק ו',
    url: '/writings/intro-religious-philosophy',
    locator_label: null,
    source_type: 'writing',
    snippet: '',
  },
];

export const FINAL = {
  text: ANSWER_TEXT,
  citations: CITATIONS,
  further_reading: FURTHER_READING,
  abstained: false,
  flags: [],
  turn_id: 'turn-0001-aaaa-bbbb',
};

export const SHARE_ID = 'Ab12Cd34Ef56Gh78Ij90Kl';
