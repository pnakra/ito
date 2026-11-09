import { describe, expect, test } from "bun:test";
import { hasCampusResourceLinks, parseCampusResources } from "../src/lib/campusResources";

describe("campus pilot links", () => {
  test("accepts named campus support and reporting links over HTTPS", () => {
    const config = parseCampusResources("?campus=Example%20College&support_url=https%3A%2F%2Fexample.edu%2Fsupport&report_url=https%3A%2F%2Fexample.edu%2Freport");
    expect(config.campus).toBe("Example College");
    expect(config.supportUrl).toBe("https://example.edu/support");
    expect(config.reportUrl).toBe("https://example.edu/report");
    expect(hasCampusResourceLinks(config)).toBe(true);
  });
  test("rejects script and non-HTTPS links", () => {
    const config = parseCampusResources("?support_url=javascript%3Aalert(1)&report_url=http%3A%2F%2Fexample.edu%2Freport");
    expect(config.supportUrl).toBeUndefined();
    expect(config.reportUrl).toBeUndefined();
    expect(hasCampusResourceLinks(config)).toBe(false);
  });
});
