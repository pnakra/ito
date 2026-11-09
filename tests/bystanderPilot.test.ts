import { describe, expect, test } from "bun:test";
import { summarizeBystanderPilot } from "../src/lib/bystanderPilot";

describe("aggregate bystander pilot snapshot", () => {
  test("computes confidence change from paired answers only", () => {
    const result = summarizeBystanderPilot([
      { session_id: "a", confidence_pre: 2, confidence_post: 4, outcome: "told-someone" },
      { session_id: "b", confidence_pre: 3, confidence_post: 3, outcome: "checked-on-them" },
      { session_id: "c", confidence_pre: 5, confidence_post: null, outcome: null },
    ], []);
    expect(result.confidenceCount).toBe(2);
    expect(result.confidencePre).toBe(2.5);
    expect(result.confidencePost).toBe(3.5);
    expect(result.confidenceDelta).toBe(1);
  });
  test("counts selected intervention types and unique practice sessions without narrative text", () => {
    const result = summarizeBystanderPilot([
      { session_id: "a", confidence_pre: null, confidence_post: null, outcome: "told-someone" },
      { session_id: "b", confidence_pre: null, confidence_post: null, outcome: "told-someone" },
    ], [
      { session_id: "a", choice_value: "him-sidechat" },
      { session_id: "a", choice_value: "him-fizz" },
      { session_id: "outside-beta", choice_value: "him-sidechat" },
    ]);
    expect(result.interventions.get("told-someone")).toBe(2);
    expect(result.practiceCompletions).toBe(2);
    expect(result.practiceSessions).toBe(1);
    expect(result.scenarios.get("him-fizz")).toBe(1);
  });
});
