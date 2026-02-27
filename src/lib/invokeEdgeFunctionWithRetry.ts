import { supabase } from "@/integrations/supabase/client";

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  label?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

const getErrorStatus = (error: unknown): number | undefined => {
  const maybe = error as { status?: unknown; context?: { status?: unknown } };
  const status = maybe?.status ?? maybe?.context?.status;
  return typeof status === "number" ? status : undefined;
};

const isRetriableStatus = (status?: number): boolean => {
  if (!status) return false;
  return status === 408 || status === 425 || status === 500 || status === 502 || status === 503 || status === 504;
};

export const isLikelyTransientEdgeError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("timeout") ||
    message.includes("gateway") ||
    message.includes("temporarily unavailable") ||
    message.includes("http 5")
  );
};

export async function invokeEdgeFunctionWithRetry<T>(
  functionName: string,
  body: unknown,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 2, baseDelayMs = 500, label = functionName } = options;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) {
        const status = getErrorStatus(error);
        const message = getErrorMessage(error);

        if (status === 429) {
          throw new Error("You're sending messages quickly. Please wait a few seconds and try again.");
        }

        if (status === 402) {
          throw new Error("AI credits are temporarily exhausted. Please try again later.");
        }

        const shouldRetry = attempt < maxRetries && (isRetriableStatus(status) || isLikelyTransientEdgeError(message));
        if (!shouldRetry) {
          throw new Error(message || "The assistant couldn't respond right now. Please try again.");
        }

        lastError = new Error(message);
        const retryDelay = baseDelayMs * (attempt + 1);
        console.warn(`[ITO-DIAG] ${label} transient error on attempt ${attempt + 1}. Retrying in ${retryDelay}ms.`);
        await sleep(retryDelay);
        continue;
      }

      if (data && typeof (data as { error?: unknown }).error === "string") {
        const message = (data as { error: string }).error;
        const shouldRetry = attempt < maxRetries && isLikelyTransientEdgeError(message);
        if (!shouldRetry) {
          throw new Error(message);
        }

        lastError = new Error(message);
        const retryDelay = baseDelayMs * (attempt + 1);
        console.warn(`[ITO-DIAG] ${label} payload error on attempt ${attempt + 1}. Retrying in ${retryDelay}ms.`);
        await sleep(retryDelay);
        continue;
      }

      return (data as T) ?? ({} as T);
    } catch (error) {
      lastError = error;
      const status = getErrorStatus(error);
      const shouldRetry =
        attempt < maxRetries &&
        (isRetriableStatus(status) || isLikelyTransientEdgeError(error));

      if (!shouldRetry) {
        throw error instanceof Error ? error : new Error(getErrorMessage(error));
      }

      const retryDelay = baseDelayMs * (attempt + 1);
      console.warn(`[ITO-DIAG] ${label} exception on attempt ${attempt + 1}. Retrying in ${retryDelay}ms.`);
      await sleep(retryDelay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("The assistant couldn't respond right now. Please try again.");
}
