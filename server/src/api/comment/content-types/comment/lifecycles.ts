import { GoogleGenerativeAI } from "@google/generative-ai";

const ANSWERER_TRIGGER = "שלום צדיק";

// --- Prompt constants (ported from gemini-proxy/src/modules/shared/categoryUtils.ts) ---

const EXAMPLES = [
  {
    title: "היחס לגיוס לצה״ל להגותו של שעיהו ליבוביץ",
    description:
      "אשמח לדעת מה דעת הפרופסור לגביי גיוס לצבא בעד או לא ומה הוא חושב על דעתו של פרופסור ישעיהו ליבוביץ בכלל גם צבאי וגם איך הוא תופס את משנתו של ליבוביץ",
    expectedCategories: ["כללי"],
  },
  {
    title: "השכל העיוני",
    description:
      "על פי הפילוסופיה של הרמב״ם, השכל העיוני הוא חלק מהשכל האחראי על ידע תיאורטי, כמו מדעי טבע, להבדיל מידע מעשי כמו הנדסה. ידע זה כולל הבנה מושגית של דברים, לדוגמה, מי הוא אלוהים להבדיל מאיך לדבר עם אלוהים. השכל העיוני נחשב לכוח החשוב ביותר מכל כוחות הנפש, והוא היחיד שממשיך להתקיים גם לאחר המוות.",
    expectedCategories: ["רמב״ם", "פילוסופיה אריסטוטלית"],
  },
];

function buildCategoryPrompt(
  title: string,
  description: string,
  categories: string[],
  clarificationParagraph?: string
): string {
  const categoriesList = categories
    .map((cat, i) => `${i + 1}. ${cat}`)
    .join("\n");

  const examples = EXAMPLES.map(
    (ex) =>
      `כותרת: "${ex.title}"\nתיאור: "${ex.description}"\nתשובה נכונה: ${JSON.stringify(ex.expectedCategories)}`
  ).join("\n\n");

  return `אתה עוזר לזיהוי קטגוריות בתחום הפילוסופיה היהודית עבור אתר אקדמי. אני רוצה שתנתח כותרת ותיאור של תוכן ותזהה את הקטגוריות הרלוונטיות ביותר בצורה מדויקת ומדעית.

כותרת: ${title}
תיאור: ${description}${clarificationParagraph ? `\nהקשר נוסף להבהרה: ${clarificationParagraph}` : ""}

רשימת הקטגוריות הזמינות:
${categoriesList}

חשוב מאוד: זהו אתר אקדמי ונדרשת דיוק מקסימלי. בחר רק קטגוריות שיש להן קשר ישיר ומוכח לתוכן הנתון.

עקרונות לבחירה:
1. דיוק אקדמי: בחר רק קטגוריות שהן רלוונטיות באופן ישיר לכותרת ולתיאור
2. זיהוי ראשי תיבות: רס״ג = רבי סעדיה גאון, רמב״ם = רבי משה בן מימון, וכו׳
3. זיהוי ספרים ומחבריהם:
   - מורה נבוכים, שמונה פרקים, משנה תורה = רמב״ם
   - אמונות ודעות = רס״ג
   - ספר יצירה, ספר הזוהר = קבלה
4. תוכן חז״ל: כל תוכן הקשור למשנה, תלמוד או חכמים מאותה תקופה = חז״ל
5. אל תגביל את מספר הקטגוריות - התמקד בדיוק בלבד
6. הימנע מכפייה: אל תנסה לכפות קטגוריות שאינן מתאימות

דוגמאות:

חשוב: הדוגמאות הבאות הן רק דוגמאות מייצגות ולא מגבילות. יש אפשרויות רבות נוספות וצירופים שונים של קטגוריות בהתאם לתוכן הספציפי.

${examples}

שוב, אלו רק דוגמאות - יש מקרים רבים נוספים ואתה צריך לנתח כל תוכן בנפרד ולהחליט על הקטגוריות המתאימות בדיוק לאותו תוכן ספציפי.

שקול בקפידה:
- הנושא המרכזי המוצג בכותרת ובתיאור
- ההקשר הפילוסופי והיהודי הספציפי
- הקשר המדויק לתורת ישראל ולמסורת היהודית
- ערכי היסוד והמושגים היהודיים המרכזיים המוזכרים
- זיהוי מחברים דרך ספריהם או ראשי תיבות
- כל תוכן הוא ייחודי - אל תסתמך רק על הדוגמאות, נתח את התוכן הספציפי הזה

אם התוכן אינו מתאים לאף קטגוריה מהרשימה, החזר רשימה ריקה.

החזר תשובה בפורמט JSON בלבד:
{
  "categories": ["קטגוריה מהרשימה 1", "קטגוריה מהרשימה 2"]
}

אל תוסיף סימני קוד או עיצוב markdown.
ודא שאתה בוחר רק קטגוריות מהרשימה שסופקה.
זכור: דיוק אקדמי חשוב יותר מכמות הקטגוריות.
הדוגמאות שניתנו הן רק דוגמאות - יכולות להיות הרבה קטגוריות אחרות או צירופים שונים לחלוטין בהתאם לתוכן הספציפי.`;
}

function cleanResponseText(text: string): string {
  let clean = text.trim();
  if (clean.startsWith("```json")) clean = clean.replace(/^```json\s*/, "");
  if (clean.startsWith("```")) clean = clean.replace(/^```\s*/, "");
  if (clean.endsWith("```")) clean = clean.replace(/\s*```$/, "");
  return clean.trim();
}

function parseCategories(responseText: string, validNames: string[]): string[] {
  try {
    const parsed = JSON.parse(cleanResponseText(responseText));
    const arr = Array.isArray(parsed) ? parsed : parsed?.categories;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (c: unknown) => typeof c === "string" && validNames.includes(c.trim())
    );
  } catch {
    // Fallback: check which category names appear in the raw text
    return validNames.filter((name) => responseText.includes(name));
  }
}

// --- Core async categorization logic ---

async function categorizeResponsa(
  strapi: any,
  responsaId: number,
  commentAnswerText: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    strapi.log.warn(
      "[auto-categorize] GEMINI_API_KEY not set — skipping categorization"
    );
    return;
  }

  // 1. Fetch the full responsa with its current categories
  const responsa = await strapi.entityService.findOne(
    "api::responsa.responsa",
    responsaId,
    {
      populate: { categories: { fields: ["id", "name"] } },
      fields: ["id", "title", "content"],
    }
  );

  if (!responsa) {
    strapi.log.warn(
      `[auto-categorize] Responsa ${responsaId} not found — skipping`
    );
    return;
  }

  // Skip if responsa already has categories assigned
  if (responsa.categories && responsa.categories.length > 0) {
    strapi.log.info(
      `[auto-categorize] Responsa "${responsa.title}" already has ${responsa.categories.length} categories — skipping`
    );
    return;
  }

  // 2. Fetch all available categories
  const allCategories = await strapi.entityService.findMany(
    "api::category.category",
    { fields: ["id", "documentId", "name"], pagination: { limit: -1 } }
  );

  if (!allCategories?.length) {
    strapi.log.warn("[auto-categorize] No categories found — skipping");
    return;
  }

  const categoryNames = allCategories.map((c: any) => c.name);

  // Strip HTML/markdown from richtext content for the prompt
  const plainContent = (responsa.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Strip HTML from comment answer text as well
  const plainComment = commentAnswerText
    ? commentAnswerText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : undefined;

  // 3. Call Gemini — pass the comment as clarification paragraph (like the script does)
  const prompt = buildCategoryPrompt(responsa.title, plainContent, categoryNames, plainComment);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // 4. Parse matched category names and resolve to IDs
  const matchedNames = parseCategories(text, categoryNames);

  if (matchedNames.length === 0) {
    strapi.log.info(
      `[auto-categorize] No categories matched for responsa "${responsa.title}"`
    );
    return;
  }

  const matchedCategories = allCategories.filter((c: any) =>
    matchedNames.includes(c.name)
  );

  const categoryIds = matchedCategories.map((c: any) => c.id);

  // 5. Update the responsa with matched categories
  await strapi.entityService.update("api::responsa.responsa", responsaId, {
    data: { categories: categoryIds },
  });

  strapi.log.info(
    `[auto-categorize] Responsa "${responsa.title}" → added categories: [${matchedNames.join(", ")}]`
  );
}

async function tryCategorizeTwice(
  strapi: any,
  responsaId: number,
  commentAnswerText: string
) {
  try {
    await categorizeResponsa(strapi, responsaId, commentAnswerText);
  } catch (err) {
    strapi.log.warn(
      `[auto-categorize] First attempt failed, retrying once… (${err})`
    );
    try {
      await categorizeResponsa(strapi, responsaId, commentAnswerText);
    } catch (retryErr) {
      strapi.log.error(
        `[auto-categorize] Retry also failed — skipping. Error: ${retryErr}`
      );
    }
  }
}

// --- Strapi lifecycle hook ---

export default {
  afterCreate(event: any) {
    const { result, params } = event;

    // Only trigger for comments by שלום צדיק on a responsa
    const answerer = result.answerer || params?.data?.answerer;
    if (answerer !== ANSWERER_TRIGGER) return;

    // Get responsa ID from result (populated or raw) or from the input params
    const responsaFromResult =
      typeof result.responsa === "object"
        ? result.responsa?.id
        : result.responsa;
    const responsaFromParams =
      typeof params?.data?.responsa === "object"
        ? params.data.responsa?.id
        : params?.data?.responsa;

    const responsaId = responsaFromResult || responsaFromParams;
    if (!responsaId) return;

    // Get the comment's answer text to use as clarification for categorization
    const commentAnswerText = result.answer || params?.data?.answer || "";

    // Fire and forget — don't block the response
    // @ts-expect-error strapi is a global in Strapi runtime
    tryCategorizeTwice(globalThis.strapi, responsaId, commentAnswerText).catch(() => {
      // Already logged inside tryCategorizeTwice
    });
  },
};
