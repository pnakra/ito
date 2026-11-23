import { beforeEach, describe, expect, test } from "bun:test";
import { logSubmission, resetSessionId } from "../src/lib/submissionLogger";

type GtagCall = { name: string; params: Record<string, unknown> };

function installGtag() {
  const calls: GtagCall[] = [];
  (globalThis as unknown as { window: unknown }).window = {
    gtag: (...args: unknown[]) => {
      const [command, name, params] = args as [
        string,
        string,
        Record<string, unknown>,
      ];
      if (command === "event") calls.push({ name, params });
    },
  };
  return calls;
}

function stubFetch(impl?: () => Promise<Response>) {
  const original = globalThis.fetch;
  globalThis.fetch = (impl
    ? (async () => impl())
    : (async () => new Response(null, { status: 201 }))) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

describe("Google Ads conversion event (ito_submission)", () => {
  let calls: GtagCall[];
  let restoreFetch: () => void;

  beforeEach(() => {
    resetSessionId();
    calls = installGtag();
    restoreFetch = stubFetch();
  });

  test("fires once when a non-practice user gets their read back", async () => {
    await logSubmission({
      flowType: "before",
      stepName: "narrative",
      stepType: "ai_response",
      aiResponseSummary: "a read",
      freetextValue: "private free text",
    });

    expect(calls.length).toBe(1);
    expect(calls[0].name).toBe("ito_submission");
  });

  test("sends flow_type only — no free text, AI text, ids or other metadata", async () => {
    await logSubmission({
      flowType: "before",
      stepName: "narrative",
      stepType: "ai_response",
      aiResponseSummary: "a read",
      freetextValue: "private free text",
      choiceValue: ["a", "b"],
      metadata: { ages: [19, 20] },
    });

    expect(calls[0].params).toEqual({ flow_type: "before" });
    expect(Object.keys(calls[0].params)).toEqual(["flow_type"]);
  });

  test("does not fire twice in the same session", async () => {
    await logSubmission({
      flowType: "before",
      stepName: "narrative",
      stepType: "ai_response",
    });
    await logSubmission({
      flowType: "before",
      stepName: "followup",
      stepType: "ai_response",
    });

    expect(calls.length).toBe(1);
  });

  test("fires again for a new session", async () => {
    await logSubmission({
      flowType: "before",
      stepName: "narrative",
      stepType: "ai_response",
    });
    resetSessionId();
    await logSubmission({
      flowType: "before",
      stepName: "narrative",
      stepType: "ai_response",
    });

    expect(calls.length).toBe(2);
  });

  test("never fires for practice", async () => {
    await logSubmission({
      flowType: "practice",
      stepName: "scene",
      stepType: "ai_response",
    });

    expect(calls.length).toBe(0);
  });

  test("never fires for non-ai_response steps", async () => {
    await logSubmission({
      flowType: "before",
      stepName: "narrative",
      stepType: "freetext",
      freetextValue: "private free text",
    });
    await logSubmission({
      flowType: "before",
      stepName: "pick",
      stepType: "choice",
      choiceValue: "yes",
    });

    expect(calls.length).toBe(0);
  });

  test("still fires when the logging request itself fails", async () => {
    restoreFetch();
    restoreFetch = stubFetch(() => Promise.reject(new Error("offline")));
    try {
      await logSubmission({
        flowType: "before",
        stepName: "narrative",
        stepType: "ai_response",
      });
      expect(calls.length).toBe(1);
    } finally {
      restoreFetch();
    }
  });
});
