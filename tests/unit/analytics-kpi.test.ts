import { describe, expect, it } from "vitest";
import { computeKpi, hashIp, logBusinessEvent, recordView } from "@/features/analytics/service";

describe("analytics privasi + KPI", () => {
  it("hash IP stabil per salt, beda antar hari, tanpa IP mentah", () => {
    const a = hashIp("1.2.3.4", "2026-09-10");
    const b = hashIp("1.2.3.4", "2026-09-10");
    const c = hashIp("1.2.3.4", "2026-09-11");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).not.toContain("1.2.3.4");
  });

  it("recordView gagal → resolve (tidak throw ke halaman)", async () => {
    await expect(
      recordView("p1", "hash", { insertView: async () => { throw new Error("db down"); } }, {}),
    ).resolves.toBeUndefined();
  });

  it("computeKpi: contact conversion = contact/views; nol aman", () => {
    const kpi = computeKpi({ views: 100, demoClicks: 20, contactClicks: 10, publishedProducts: 24, developers: 10 });
    expect(kpi.contactConversion).toBe(0.1);
    expect(kpi.demoRate).toBe(0.2);
    const empty = computeKpi({ views: 0, demoClicks: 0, contactClicks: 0, publishedProducts: 0, developers: 0 });
    expect(empty.contactConversion).toBe(0);
  });

  it("logBusinessEvent menolak payload PII/tipe aneh tanpa throw", () => {
    expect(() => logBusinessEvent({ type: "search", ref: "saas" }, {})).not.toThrow();
    expect(() => logBusinessEvent({ type: "track-location", ref: "x" }, {})).not.toThrow();
    expect(() => logBusinessEvent(null, {})).not.toThrow();
  });
});
