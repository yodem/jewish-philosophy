import { ANSWERER_TRIGGER, LOG_PREFIX } from "./utils/constants";
import { categorizeResponsa } from "./utils/categorize";
import { withRetry } from "./utils/retry";

function resolveRelationId(
  value: unknown
): number | undefined {
  if (typeof value === "object" && value !== null && "id" in value) {
    return (value as { id: number }).id;
  }
  return typeof value === "number" ? value : undefined;
}

export default {
  afterCreate(event: { result: Record<string, unknown>; params: Record<string, any> }) {
    const { result, params } = event;
    const strapi = (globalThis as any).strapi;

    const answerer = result.answerer || params?.data?.answerer;
    strapi.log.info(`${LOG_PREFIX} afterCreate fired — answerer="${answerer}"`);

    if (answerer !== ANSWERER_TRIGGER) {
      strapi.log.info(`${LOG_PREFIX} Skipping — answerer does not match trigger`);
      return;
    }

    const responsaId =
      resolveRelationId(result.responsa) ??
      resolveRelationId(params?.data?.responsa);
    if (!responsaId) {
      strapi.log.warn(`${LOG_PREFIX} No responsaId found — skipping`);
      return;
    }

    const commentAnswerText =
      (result.answer as string) || params?.data?.answer || "";

    strapi.log.info(`${LOG_PREFIX} Triggering categorization for responsa ${responsaId}`);

    withRetry(
      () => categorizeResponsa(strapi, responsaId, commentAnswerText),
      strapi.log
    ).catch((err) => {
      strapi.log?.error?.(`${LOG_PREFIX} Unhandled error: ${err}`);
    });
  },
};
