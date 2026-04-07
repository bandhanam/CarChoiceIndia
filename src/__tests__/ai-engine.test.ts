import { runAIComparison, CATEGORY_WEIGHTS } from "@/lib/ai-engine";
import { CARS } from "@/lib/car-data";

describe("AI Engine - runAIComparison", () => {
  it("should throw error when less than 2 cars selected", () => {
    expect(() => runAIComparison([CARS[0]])).toThrow(
      "Select at least 2 cars for AI comparison"
    );
  });

  it("should return a valid comparison result for 2 cars", () => {
    const selected = [CARS[0], CARS[1]];
    const result = runAIComparison(selected);

    expect(result.scores).toHaveLength(2);
    expect(result.winnerId).toBeDefined();
    expect(result.winnerName).toBeDefined();
    expect(result.modelVersion).toContain("Offline");
    expect(result.analysisTimestamp).toBeTruthy();
  });

  it("should return a valid comparison result for all cars", () => {
    const result = runAIComparison(CARS);

    expect(result.scores).toHaveLength(CARS.length);
    expect(result.winnerId).toBeTruthy();
    expect(CARS.some((c) => c.id === result.winnerId)).toBe(true);
  });

  it("should produce scores between 0 and 10", () => {
    const result = runAIComparison(CARS);

    result.scores.forEach((score) => {
      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(10);
      expect(score.categoryScores.performance).toBeGreaterThanOrEqual(0);
      expect(score.categoryScores.performance).toBeLessThanOrEqual(10);
      expect(score.categoryScores.efficiency).toBeGreaterThanOrEqual(0);
      expect(score.categoryScores.efficiency).toBeLessThanOrEqual(10);
      expect(score.categoryScores.safety).toBeGreaterThanOrEqual(0);
      expect(score.categoryScores.safety).toBeLessThanOrEqual(10);
      expect(score.categoryScores.comfort).toBeGreaterThanOrEqual(0);
      expect(score.categoryScores.comfort).toBeLessThanOrEqual(10);
      expect(score.categoryScores.technology).toBeGreaterThanOrEqual(0);
      expect(score.categoryScores.technology).toBeLessThanOrEqual(10);
      expect(score.categoryScores.value).toBeGreaterThanOrEqual(0);
      expect(score.categoryScores.value).toBeLessThanOrEqual(10);
    });
  });

  it("should rank scores in descending order", () => {
    const result = runAIComparison(CARS);

    for (let i = 1; i < result.scores.length; i++) {
      expect(result.scores[i - 1].overallScore).toBeGreaterThanOrEqual(
        result.scores[i].overallScore
      );
    }
  });

  it("should set the winner as the highest scored car", () => {
    const result = runAIComparison(CARS);
    expect(result.winnerId).toBe(result.scores[0].carId);
  });

  it("should have confidence between 0 and 1", () => {
    const result = runAIComparison(CARS);
    result.scores.forEach((score) => {
      expect(score.confidence).toBeGreaterThan(0);
      expect(score.confidence).toBeLessThanOrEqual(1);
    });
  });

  it("should generate reasoning for each car", () => {
    const result = runAIComparison(CARS);
    result.scores.forEach((score) => {
      expect(score.reasoning.length).toBeGreaterThan(0);
      expect(score.reasoning.length).toBeLessThanOrEqual(4);
    });
  });
});

describe("AI Engine - Category Weights", () => {
  it("should have weights that sum to 1", () => {
    const sum = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("should have all weights > 0", () => {
    Object.values(CATEGORY_WEIGHTS).forEach((w) => {
      expect(w).toBeGreaterThan(0);
    });
  });
});
