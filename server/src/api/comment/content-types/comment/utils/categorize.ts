import {
  RESPONSA_UID,
  CATEGORY_UID,
  LOG_PREFIX,
} from "./constants";
import { stripHtml } from "./html";
import { buildCategoryPrompt } from "./prompt";
import { generateContent, parseCategories, type GenerateResult } from "./gemini";

interface StrapiInstance {
  documents: (uid: string) => {
    findOne: (options: { documentId: string; fields?: string[]; populate?: object; status?: string }) => Promise<any>;
    findMany: (options?: { fields?: string[]; populate?: object; limit?: number; status?: string }) => Promise<any[]>;
    update: (options: { documentId: string; data: object; status?: string }) => Promise<any>;
  };
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
  // Step 1: Get documentId from numeric ID (entityService knows numeric IDs)
  const basicResponsa = await strapi.entityService.findOne(
    RESPONSA_UID,
    responsaId,
    { fields: ["id", "documentId"] }
  );

  if (!basicResponsa?.documentId) {
    strapi.log.warn(
      `${LOG_PREFIX} Responsa ${responsaId} not found — skipping`
    );
    return;
  }

  // Step 2: Read the PUBLISHED version via Document Service (has real views count)
  const responsa = await strapi.documents(RESPONSA_UID).findOne({
    documentId: basicResponsa.documentId,
    status: "published",
    fields: ["id", "documentId", "title", "content", "views"],
    populate: { categories: { fields: ["id", "name"] } },
  });

  if (!responsa) {
    strapi.log.warn(
      `${LOG_PREFIX} Published responsa ${responsaId} not found — skipping`
    );
    return;
  }

  if (responsa.categories?.length > 0) {
    strapi.log.info(
      `${LOG_PREFIX} Responsa "${responsa.title}" already has ${responsa.categories.length} categories — skipping`
    );
    return;
  }

  // Fetch categories with documentId (needed for Document Service set syntax)
  const allCategories: Category[] = await strapi.entityService.findMany(
    CATEGORY_UID,
    { fields: ["id", "documentId", "name"], pagination: { limit: -1 } }
  );

  if (!allCategories?.length) {
    strapi.log.warn(`${LOG_PREFIX} No categories found — skipping`);
    return;
  }

  const categoryNames = allCategories.map((c) => c.name.trim());
  const plainContent = stripHtml(responsa.content || "");
  const plainComment = commentAnswerText
    ? stripHtml(commentAnswerText)
    : undefined;

  const result = await generateContent(
    buildCategoryPrompt({
      title: responsa.title || "",
      description: plainContent,
      categories: categoryNames,
      clarification: plainComment,
    })
  );

  if (result.status === "no_config") {
    strapi.log.warn(
      `${LOG_PREFIX} GEMINI_API_KEY not set — skipping categorization`
    );
    return;
  }

  if (result.status === "empty_response") {
    strapi.log.warn(
      `${LOG_PREFIX} Gemini returned empty response for responsa "${responsa.title}" — skipping`
    );
    return;
  }

  const matchedNames = parseCategories(result.text, categoryNames, strapi.log);

  if (matchedNames.length === 0) {
    strapi.log.info(
      `${LOG_PREFIX} No categories matched for responsa "${responsa.title}"`
    );
    return;
  }

  const matchingCategories = allCategories.filter((c) =>
    matchedNames.includes(c.name)
  );
  const categoryDocumentIds = matchingCategories.map((c) => c.documentId);

  // Re-read views RIGHT BEFORE update (views may have incremented during Gemini API call)
  const freshResponsa = await strapi.documents(RESPONSA_UID).findOne({
    documentId: responsa.documentId,
    status: "published",
    fields: ["views"],
  });
  const currentViews = freshResponsa?.views ?? 0;

  strapi.log.info(
    `${LOG_PREFIX} BEFORE update — responsa "${responsa.title}" (docId: ${responsa.documentId}): views=${currentViews}`
  );

  // Single atomic update via Document Service — same approach as analyze-responsas.ts script
  // Uses documentId + set syntax + views in same payload to prevent race conditions on PostgreSQL
  await strapi.documents(RESPONSA_UID).update({
    documentId: responsa.documentId,
    status: "published",
    data: {
      categories: { set: categoryDocumentIds },
      views: currentViews,
    },
  });

  // Read back to verify
  const afterUpdate = await strapi.documents(RESPONSA_UID).findOne({
    documentId: responsa.documentId,
    status: "published",
    fields: ["views"],
    populate: { categories: { fields: ["name"] } },
  });

  strapi.log.info(
    `${LOG_PREFIX} AFTER update — responsa "${responsa.title}": views=${afterUpdate?.views}, categories=${afterUpdate?.categories?.length ?? 0} [${matchedNames.join(", ")}]`
  );
}
