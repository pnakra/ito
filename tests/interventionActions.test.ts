import { describe, expect, test } from "bun:test";
import { getInterventionAction, getWitnessSafetyNotes, getWitnessSuggestionOverride, isOnlineWitnessContext } from "../src/lib/interventionActions";

 describe("bystander intervention labels", () => {
  test("labels saving timestamps and URLs as Document / Collect evidence", () => {
    expect(getInterventionAction("Save the URL and timestamps privately").id).toBe("document");
  });
  test("labels bringing in a moderator as Delegate / Call in support", () => {
    expect(getInterventionAction("Report it to a platform moderator").id).toBe("delegate");
  });
  test("labels checking on them tomorrow as Delay / Check in", () => {
    expect(getInterventionAction("Check on them tomorrow and let them lead").id).toBe("delay");
  });
  test("recognizes Sidechat and Fizz as online contexts", () => {
    expect(isOnlineWitnessContext("A Sidechat thread and a Fizz post")).toBe(true);
    expect(isOnlineWitnessContext("Something happened at a party")).toBe(false);
  });
  test("a no-share preference keeps evidence private", () => {
    expect(getWitnessSafetyNotes({ targetPreference: "no-share" })[0]).toContain("Keep screenshots and details private");
  });
  test("retaliation against the witness avoids required confrontation", () => {
    expect(getWitnessSafetyNotes({ witnessSafety: "self" })[0]).toContain("do not have to confront anyone");
  });
});
