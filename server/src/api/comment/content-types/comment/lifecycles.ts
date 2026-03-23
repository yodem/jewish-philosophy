import { ANSWERER_TRIGGER } from "./utils/constants";
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

    const answerer = result.answerer || params?.data?.answerer;
    if (answerer !== ANSWERER_TRIGGER) return;

    const responsaId =
      resolveRelationId(result.responsa) ??
      resolveRelationId(params?.data?.responsa);
    if (!responsaId) return;

    const commentAnswerText =
      (result.answer as string) || params?.data?.answer || "";

    const strapi = (globalThis as any).strapi;

    withRetry(
      () => categorizeResponsa(strapi, responsaId, commentAnswerText),
      strapi.log
    ).catch(() => {
      // Already logged inside withRetry
    });
  },
};
