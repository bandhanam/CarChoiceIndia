import nested from "../../public/data/indian-nested-auto-catalog-2026.json";
import type { IndianNestedAutoCatalog2026 } from "@/types";

const data = nested as IndianNestedAutoCatalog2026;

describe("indian-nested-auto-catalog-2026.json", () => {
  it("has meta and nested manufacturers → cars → variants", () => {
    expect(data.meta.schemaVersion).toBe("2.0");
    expect(data.meta.market).toBe("India");
    expect(data.manufacturers.length).toBeGreaterThanOrEqual(8);
    expect(data.meta.totalCarLines).toBeGreaterThanOrEqual(40);
    expect(data.meta.totalVariants).toBeGreaterThan(100);
  });

  it("each car line has isFacelift boolean and model-level features", () => {
    for (const m of data.manufacturers) {
      expect(m.id).toBeTruthy();
      expect(m.companyLegalName).toBeTruthy();
      for (const car of m.cars) {
        expect(typeof car.isFacelift).toBe("boolean");
        expect(car.features.safety.length).toBeGreaterThanOrEqual(1);
        expect(car.variants.length).toBeGreaterThanOrEqual(2);
        for (const v of car.variants) {
          expect(v.trimName).toBeTruthy();
          expect(v.exShowroomPriceInr).toBeGreaterThan(0);
          expect(v.features.inheritsFromModel).toBe(true);
        }
      }
    }
  });

  it("marks known 2026 media-reported facelifts", () => {
    const hyundai = data.manufacturers.find((x) => x.id === "hyundai");
    const verna = hyundai?.cars.find((c) => c.id === "hyundai-verna-2025");
    expect(verna?.isFacelift).toBe(true);
    expect(verna?.modelYear).toBe(2026);
  });
});
