import { Car, AIScore, ComparisonResult } from "@/types";

const CATEGORY_WEIGHTS = {
  performance: 0.20,
  efficiency: 0.15,
  safety: 0.20,
  comfort: 0.15,
  technology: 0.15,
  value: 0.15,
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

function computePerformanceScore(car: Car): number {
  const hpScore = normalize(car.specs.horsepower, 60, 250);
  const accelScore = 1 - normalize(car.specs.acceleration, 5, 15);
  const topSpeedScore = normalize(car.specs.topSpeed, 140, 220);
  const torqueNum = parseInt(car.specs.torque) || 100;
  const torqueScore = normalize(torqueNum, 80, 500);

  const raw = hpScore * 0.35 + accelScore * 0.25 + topSpeedScore * 0.2 + torqueScore * 0.2;
  return sigmoid((raw - 0.5) * 6) * 10;
}

function computeEfficiencyScore(car: Car): number {
  const isElectric = car.specs.fuelType === "Electric";
  let mileageScore: number;

  if (isElectric) {
    mileageScore = normalize(car.specs.mileage, 200, 700);
  } else {
    mileageScore = normalize(car.specs.mileage, 8, 30);
  }

  const fuelTypeBonus = isElectric ? 0.15 : car.specs.fuelType.includes("Hybrid") ? 0.08 : 0;

  const raw = Math.min(mileageScore + fuelTypeBonus, 1);
  return sigmoid((raw - 0.5) * 6) * 10;
}

function computeSafetyScore(car: Car): number {
  const featureCount = car.features.safety.length;
  const countScore = normalize(featureCount, 2, 8);

  const hasADAS = car.features.safety.some((f) => f.toLowerCase().includes("adas"));
  const has360Cam = car.features.safety.some((f) => f.includes("360"));
  const hasESP = car.features.safety.some(
    (f) => f.includes("ESP") || f.includes("ESC")
  );
  const hasAirbags = car.features.safety.some((f) => f.includes("Airbag"));

  let bonusScore = 0;
  if (hasADAS) bonusScore += 0.2;
  if (has360Cam) bonusScore += 0.1;
  if (hasESP) bonusScore += 0.1;
  if (hasAirbags) bonusScore += 0.1;

  const raw = Math.min(countScore * 0.5 + bonusScore + car.ratings.safety / 10 * 0.3, 1);
  return sigmoid((raw - 0.5) * 6) * 10;
}

function computeComfortScore(car: Car): number {
  const featureCount = car.features.comfort.length;
  const countScore = normalize(featureCount, 2, 8);

  const hasVentilated = car.features.comfort.some((f) =>
    f.toLowerCase().includes("ventilated")
  );
  const hasSunroof = car.features.comfort.some((f) =>
    f.toLowerCase().includes("sunroof")
  );
  const hasClimate = car.features.comfort.some((f) =>
    f.toLowerCase().includes("climate")
  );

  let bonusScore = 0;
  if (hasVentilated) bonusScore += 0.12;
  if (hasSunroof) bonusScore += 0.1;
  if (hasClimate) bonusScore += 0.08;

  const raw = Math.min(countScore * 0.5 + bonusScore + car.ratings.comfort / 10 * 0.3, 1);
  return sigmoid((raw - 0.5) * 6) * 10;
}

function computeTechnologyScore(car: Car): number {
  const featureCount = car.features.technology.length;
  const countScore = normalize(featureCount, 2, 8);

  const hasConnected = car.features.technology.some((f) =>
    f.toLowerCase().includes("connected")
  );
  const hasOTA = car.features.technology.some((f) =>
    f.toLowerCase().includes("ota")
  );
  const hasWireless = car.features.technology.some(
    (f) =>
      f.toLowerCase().includes("wireless") ||
      f.toLowerCase().includes("carplay")
  );

  let bonusScore = 0;
  if (hasConnected) bonusScore += 0.12;
  if (hasOTA) bonusScore += 0.1;
  if (hasWireless) bonusScore += 0.08;

  const raw = Math.min(countScore * 0.5 + bonusScore + car.ratings.technology / 10 * 0.3, 1);
  return sigmoid((raw - 0.5) * 6) * 10;
}

function computeValueScore(car: Car, allCars: Car[]): number {
  const prices = allCars.map((c) => c.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceScore = 1 - normalize(car.price, minPrice, maxPrice);

  const totalFeatures =
    car.features.safety.length +
    car.features.comfort.length +
    car.features.technology.length +
    car.features.exterior.length;
  const featureDensity = totalFeatures / (car.price / 100000);
  const densityScore = normalize(featureDensity, 0.5, 4);

  const avgRating = Object.values(car.ratings).reduce((a, b) => a + b, 0) / 6;
  const ratingScore = normalize(avgRating, 5, 10);

  const raw = priceScore * 0.3 + densityScore * 0.35 + ratingScore * 0.35;
  return sigmoid((raw - 0.5) * 6) * 10;
}

function generateReasoning(car: Car, scores: AIScore["categoryScores"]): string[] {
  const reasons: string[] = [];
  const entries = Object.entries(scores) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const topCategory = entries[0][0];
  const weakCategory = entries[entries.length - 1][0];

  const categoryLabels: Record<string, string> = {
    performance: "Performance",
    efficiency: "Fuel Efficiency",
    safety: "Safety",
    comfort: "Comfort",
    technology: "Technology",
    value: "Value for Money",
  };

  reasons.push(
    `Strongest in ${categoryLabels[topCategory]} (${entries[0][1].toFixed(1)}/10)`
  );

  if (car.specs.fuelType === "Electric") {
    reasons.push("Zero emissions with excellent range efficiency");
  } else if (car.specs.mileage > 20) {
    reasons.push(`Impressive ${car.specs.mileage} km/l fuel economy`);
  }

  if (car.specs.horsepower > 150) {
    reasons.push(`Powerful ${car.specs.horsepower} HP engine delivers strong acceleration`);
  }

  const totalFeatures =
    car.features.safety.length +
    car.features.comfort.length +
    car.features.technology.length;
  if (totalFeatures > 14) {
    reasons.push(`Feature-rich with ${totalFeatures}+ safety, comfort & tech features`);
  }

  reasons.push(
    `Area for improvement: ${categoryLabels[weakCategory]} (${entries[entries.length - 1][1].toFixed(1)}/10)`
  );

  return reasons.slice(0, 4);
}

export function runAIComparison(selectedCars: Car[]): ComparisonResult {
  if (selectedCars.length < 2) {
    throw new Error("Select at least 2 cars for AI comparison");
  }

  const scores: AIScore[] = selectedCars.map((car) => {
    const categoryScores = {
      performance: computePerformanceScore(car),
      efficiency: computeEfficiencyScore(car),
      safety: computeSafetyScore(car),
      comfort: computeComfortScore(car),
      technology: computeTechnologyScore(car),
      value: computeValueScore(car, selectedCars),
    };

    const overallScore =
      categoryScores.performance * CATEGORY_WEIGHTS.performance +
      categoryScores.efficiency * CATEGORY_WEIGHTS.efficiency +
      categoryScores.safety * CATEGORY_WEIGHTS.safety +
      categoryScores.comfort * CATEGORY_WEIGHTS.comfort +
      categoryScores.technology * CATEGORY_WEIGHTS.technology +
      categoryScores.value * CATEGORY_WEIGHTS.value;

    const scoreDiversity =
      Math.max(...Object.values(categoryScores)) -
      Math.min(...Object.values(categoryScores));
    const confidence = Math.min(0.95, 0.7 + (1 - scoreDiversity / 10) * 0.25);

    return {
      carId: car.id,
      overallScore: parseFloat(overallScore.toFixed(2)),
      categoryScores: {
        performance: parseFloat(categoryScores.performance.toFixed(2)),
        efficiency: parseFloat(categoryScores.efficiency.toFixed(2)),
        safety: parseFloat(categoryScores.safety.toFixed(2)),
        comfort: parseFloat(categoryScores.comfort.toFixed(2)),
        technology: parseFloat(categoryScores.technology.toFixed(2)),
        value: parseFloat(categoryScores.value.toFixed(2)),
      },
      confidence: parseFloat(confidence.toFixed(2)),
      reasoning: generateReasoning(car, categoryScores),
    };
  });

  scores.sort((a, b) => b.overallScore - a.overallScore);

  const winner = selectedCars.find((c) => c.id === scores[0].carId)!;

  return {
    scores,
    winnerId: scores[0].carId,
    winnerName: winner.name,
    analysisTimestamp: new Date().toISOString(),
    modelVersion: "CarSelector AI v1.0 (Offline)",
  };
}

export { CATEGORY_WEIGHTS };
