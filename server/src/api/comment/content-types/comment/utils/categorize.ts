import {
  RESPONSA_UID,
  CATEGORY_UID,
  LOG_PREFIX,
} from "./constants";
import { stripHtml } from "./html";
import { buildCategoryPrompt } from "./prompt";
import { generateContent, parseCategories } from "./gemini";

interface StrapiInstance {
  entityService: {
    findOne: (uid: string, id: number, options?: object) => Promise<any>;
    findMany: (uid: string, options?: object) => Promise<any[]>;
    update: (uid: string, id: number, options: object) => Promise<any>;
  };
  log: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}

interface Category {
  id: number;
  documentId: string;
  name: string;
}

export async function categorizeResponsa(
  strapi: StrapiInstance,
  responsaId: number,
  commentAnswerText: string
): Promise<void> {
  const responsa = await strapi.entityService.findOne(
    RESPONSA_UID,
    responsaId,
    {
      populate: { categories: { fields: ["id", "name"] } },
      fields: ["id", "title", "content"],
    }
  );

  if (!responsa) {
    strapi.log.warn(
      `${LOG_PREFIX} Responsa ${responsaId} not found — skipping`
    );
    return;
  }

  if (responsa.categories?.length > 0) {
    strapi.log.info(
      `${LOG_PREFIX} Responsa "${responsa.title}" already has ${responsa.categories.length} categories — skipping`
    );
    return;
  }

  const allCategories: Category[] = await strapi.entityService.findMany(
    CATEGORY_UID,
    { fields: ["id", "documentId", "name"], pagination: { limit: -1 } }
  );

  if (!allCategories?.length) {
    strapi.log.warn(`${LOG_PREFIX} No categories found — skipping`);
    return;
  }

  const categoryNames = allCategories.map((c) => c.name);
  const plainContent = stripHtml(responsa.content || "");
  const plainComment = commentAnswerText
    ? stripHtml(commentAnswerText)
    : undefined;

  const responseText = await generateContent(
    buildCategoryPrompt({
      title: responsa.title,
      description: plainContent,
      categories: categoryNames,
      clarification: plainComment,
    })
  );

  if (!responseText) {
    strapi.log.warn(
      `${LOG_PREFIX} GEMINI_API_KEY not set — skipping categorization`
    );
    return;
  }

  const matchedNames = parseCategories(responseText, categoryNames);

  if (matchedNames.length === 0) {
    strapi.log.info(
      `${LOG_PREFIX} No categories matched for responsa "${responsa.title}"`
    );
    return;
  }

  const categoryIds = allCategories
    .filter((c) => matchedNames.includes(c.name))
    .map((c) => c.id);

  await strapi.entityService.update(RESPONSA_UID, responsaId, {
    data: { categories: categoryIds },
  });

  strapi.log.info(
    `${LOG_PREFIX} Responsa "${responsa.title}" → added categories: [${matchedNames.join(", ")}]`
  );
}
