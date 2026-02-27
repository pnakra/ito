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

const isTransportFailureMessage = (message: string): boolean => {
  return (
    message.includes("failed to send") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("request to the edge function")
  );
};

export const isLikelyTransientEdgeError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    isTransportFailureMessage(message) ||
    message.includes("timeout") ||
    message.includes("gateway") ||
    message.includes("temporarily unavailable") ||
    message.includes("http 5") ||
    message.includes("edge function")
  );
};

const createErrorWithStatus = (message: string, status?: number): Error => {
  const err = new Error(message) as Error & { status?: number };
  if (typeof status === "number") err.status = status;
  return err;
};

const invokeEdgeFunctionDirect = async <T>(functionName: string, body: unknown): Promise<T> => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!baseUrl || !publishableKey) {
    throw new Error("Missing backend configuration for direct fallback call.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken ?? publishableKey}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  const responseText = await response.text();
  let parsed: unknown = {};

  if (responseText) {
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { error: responseText };
    }
  }

  if (!response.ok) {
    const payloadError =
      parsed && typeof (parsed as { error?: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : "";

    throw createErrorWithStatus(payloadError || `HTTP ${response.status}`, response.status);
  }

  return (parsed as T) ?? ({} as T);
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
        throw error;
      }

      if (data && typeof (data as { error?: unknown }).error === "string") {
        throw new Error((data as { error: string }).error);
      }

      return (data as T) ?? ({} as T);
    } catch (rawError) {
      let error = rawError;
      const message = getErrorMessage(error);
      const status = getErrorStatus(error);

      const shouldTryDirectFallback = isTransportFailureMessage(message.toLowerCase()) || (!status && isLikelyTransientEdgeError(error));

      if (shouldTryDirectFallback) {
        try {
          console.warn(`[ITO-DIAG] ${label} transport issue on attempt ${attempt + 1}. Trying direct fallback call.`);
          const fallbackData = await invokeEdgeFunctionDirect<T>(functionName, body);
          return fallbackData;
        } catch (fallbackError) {
          error = fallbackError;
        }
      }

      const effectiveStatus = getErrorStatus(error);
      const effectiveMessage = getErrorMessage(error);

      if (effectiveStatus === 429) {
        throw new Error("You're sending messages quickly. Please wait a few seconds and try again.");
      }

      if (effectiveStatus === 402) {
        throw new Error("AI credits are temporarily exhausted. Please try again later.");
      }

      const shouldRetry =
        attempt < maxRetries &&
        (isRetriableStatus(effectiveStatus) || isLikelyTransientEdgeError(error));

      if (!shouldRetry) {
        throw error instanceof Error
          ? error
          : new Error(effectiveMessage || "The assistant couldn't respond right now. Please try again.");
      }

      lastError = error;
      const retryDelay = baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
      console.warn(`[ITO-DIAG] ${label} retrying after attempt ${attempt + 1}. Waiting ${retryDelay}ms.`);
      await sleep(retryDelay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("The assistant couldn't respond right now. Please try again.");
}

