import { coerceCarMarketEstimate } from "@/lib/openai-estimate-coerce";

describe("coerceCarMarketEstimate", () => {
  it("accepts valid payload", () => {
    const e = coerceCarMarketEstimate({
      disclaimer: "Test",
      currency: "INR",
      estimatedExShowroomMinInr: 800000,
      estimatedExShowroomMaxInr: 950000,
      highlights: ["A", "B"],
      featureNotes: ["Sunroof optional"],
      confidenceNote: "Uncertain",
      asOfHint: "2026",
    });
    expect(e).not.toBeNull();
    expect(e!.estimatedExShowroomMinInr).toBe(800000);
    expect(e!.highlights).toHaveLength(2);
  });

  it("rejects invalid prices", () => {
    expect(coerceCarMarketEstimate({ estimatedExShowroomMinInr: 0 })).toBeNull();
    expect(
      coerceCarMarketEstimate({
        estimatedExShowroomMinInr: 900000,
        estimatedExShowroomMaxInr: 800000,
      })
    ).toBeNull();
  });
});
