import { LOG_PREFIX, MAX_RETRIES } from "./constants";

interface Logger {
  warn: (msg: string) => void;
  error: (msg: string) => void;
}

export async function withRetry(
  fn: () => Promise<void>,
  logger: Logger
): Promise<void> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        logger.warn(
          `${LOG_PREFIX} Attempt ${attempt + 1} failed, retrying… (${err})`
        );
      } else {
        logger.error(
          `${LOG_PREFIX} All ${MAX_RETRIES + 1} attempts failed — skipping. Error: ${err}`
        );
      }
    }
  }
}
