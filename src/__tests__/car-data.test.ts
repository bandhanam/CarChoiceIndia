import { CARS, BRANDS, getCarById, formatPrice, getBrandGroups, getBrandMeta } from "@/lib/car-data";

describe("Car Data", () => {
  it("should have at least 40 cars across multiple brands", () => {
    expect(CARS.length).toBeGreaterThanOrEqual(40);
  });

  it("should have unique IDs for all cars", () => {
    const ids = CARS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("each car should have required fields", () => {
    CARS.forEach((car) => {
      expect(car.id).toBeTruthy();
      expect(car.name).toBeTruthy();
      expect(car.brand).toBeTruthy();
      expect(car.year).toBeGreaterThanOrEqual(2025);
      expect(car.price).toBeGreaterThan(0);
      expect(car.specs).toBeDefined();
      expect(car.features).toBeDefined();
      expect(car.ratings).toBeDefined();
      expect(car.imageUrl).toBeTruthy();
      expect(car.imageUrl).toMatch(/^(https:\/\/|\/images\/)/);
    });
  });

  it("each car should have at least 2 variants with name and price", () => {
    CARS.forEach((car) => {
      expect(car.variants).toBeDefined();
      expect(car.variants!.length).toBeGreaterThanOrEqual(2);
      car.variants!.forEach((v) => {
        expect(v.name).toBeTruthy();
        expect(v.price).toBeGreaterThan(0);
      });
    });
  });

  it("each car should have seating capacity and colors", () => {
    CARS.forEach((car) => {
      expect(car.seatingCapacity).toBeGreaterThan(0);
      expect(car.colors).toBeDefined();
      expect(car.colors!.length).toBeGreaterThan(0);
    });
  });

  it("each car should have valid ratings between 0 and 10", () => {
    CARS.forEach((car) => {
      Object.values(car.ratings).forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(10);
      });
    });
  });

  it("each car should have at least 3 safety features", () => {
    CARS.forEach((car) => {
      expect(car.features.safety.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("Brands", () => {
  it("should have at least 8 brands", () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(8);
  });

  it("each brand should have name, emoji, color, country", () => {
    BRANDS.forEach((b) => {
      expect(b.name).toBeTruthy();
      expect(b.emoji).toBeTruthy();
      expect(b.color).toBeTruthy();
      expect(b.country).toBeTruthy();
    });
  });

  it("every car brand should exist in brands list", () => {
    const brandNames = new Set(BRANDS.map((b) => b.name));
    CARS.forEach((car) => {
      expect(brandNames.has(car.brand)).toBe(true);
    });
  });
});

describe("getBrandGroups", () => {
  it("should group cars by brand", () => {
    const groups = getBrandGroups();
    expect(groups.length).toBeGreaterThanOrEqual(8);
    groups.forEach((g) => {
      expect(g.brand.name).toBeTruthy();
      expect(g.cars.length).toBeGreaterThanOrEqual(1);
      g.cars.forEach((c) => {
        expect(c.brand).toBe(g.brand.name);
      });
    });
  });
});

describe("getBrandMeta", () => {
  it("should find Tata brand metadata", () => {
    const meta = getBrandMeta("Tata");
    expect(meta).toBeDefined();
    expect(meta!.color).toBeTruthy();
  });

  it("should return undefined for unknown brand", () => {
    expect(getBrandMeta("FakeBrand")).toBeUndefined();
  });
});

describe("getCarById", () => {
  it("should find a car by valid ID", () => {
    const car = getCarById("tata-curvv-ev");
    expect(car).toBeDefined();
    expect(car!.name).toBe("Tata Curvv EV");
  });

  it("should return undefined for invalid ID", () => {
    expect(getCarById("nonexistent-car")).toBeUndefined();
  });
});

describe("formatPrice", () => {
  it("should format price in Lakh for values >= 1 lakh", () => {
    expect(formatPrice(699000)).toBe("₹6.99 Lakh");
    expect(formatPrice(1799000)).toBe("₹17.99 Lakh");
  });

  it("should format price in Cr for values >= 1 crore", () => {
    expect(formatPrice(10000000)).toBe("₹1.00 Cr");
  });

  it("should format small values normally", () => {
    const result = formatPrice(50000);
    expect(result).toContain("₹");
    expect(result).toContain("50,000");
  });
});
