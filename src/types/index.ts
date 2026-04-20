export interface CarSpecs {
  engine: string;
  horsepower: number;
  torque: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  mileage: number;
  acceleration: number;
  topSpeed: number;
}

export interface CarFeatures {
  safety: string[];
  comfort: string[];
  technology: string[];
  exterior: string[];
}

export interface CarRatings {
  performance: number;
  fuelEfficiency: number;
  safety: number;
  comfort: number;
  technology: number;
  valueForMoney: number;
}

export interface CarVariant {
  name: string;
  price: number;
  [key: string]: string | number;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  category: string;
  imageEmoji: string;
  imageUrl: string;
  gallery?: string[];
  color: string;
  specs: CarSpecs;
  features: CarFeatures;
  ratings: CarRatings;
  variants?: CarVariant[];
  description: string;
  bodyType?: string;
  seatingCapacity?: number;
  colors?: string[];
}

export interface BrandMeta {
  name: string;
  emoji: string;
  color: string;
  country: string;
}

export interface BrandGroup {
  brand: BrandMeta;
  cars: Car[];
}

export interface CarsDataset {
  version: string;
  lastUpdated: string;
  brands: BrandMeta[];
  cars: Car[];
}

export interface AIScore {
  carId: string;
  overallScore: number;
  categoryScores: {
    performance: number;
    efficiency: number;
    safety: number;
    comfort: number;
    technology: number;
    value: number;
  };
  confidence: number;
  reasoning: string[];
}

export interface ComparisonResult {
  scores: AIScore[];
  winnerId: string;
  winnerName: string;
  analysisTimestamp: string;
  modelVersion: string;
}
