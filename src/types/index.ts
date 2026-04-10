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
  launchDate?: string;
  bodyType?: string;
  seatingCapacity?: number;
  bootSpace?: string;
  groundClearance?: string;
  kerbWeight?: string;
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

/** Trim-level pricing in the India market catalog (see indian-cars-catalog.json). */
export interface IndianCatalogVariant {
  name: string;
  price: number;
}

/** One model line in the extended India catalog; variants mirror cars.json when hasDetailedProfile is true. */
export interface IndianCatalogEntry {
  id: string;
  brand: string;
  model: string;
  modelYear: number;
  segment: string;
  fuelTypes: string[];
  priceMinInr: number;
  priceMaxInr: number;
  status: "on_sale" | "upcoming";
  hasDetailedProfile: boolean;
  /** Present when merged from cars.json or when listed in indian-catalog-source.json. */
  variants?: IndianCatalogVariant[];
}

export interface IndianCarsCatalog {
  version: string;
  lastUpdated: string;
  currency: string;
  disclaimer: string;
  entryCount: number;
  detailedProfileCount: number;
  entries: IndianCatalogEntry[];
}

/** Nested India catalog: manufacturer → car line → variants (see indian-nested-auto-catalog-2026.json). */
export interface NestedCatalogVariantFeatures {
  inheritsFromModel: boolean;
  trimSpecific: {
    safety: string[];
    comfort: string[];
    technology: string[];
    exterior: string[];
  };
}

export interface NestedCatalogVariant {
  id: string;
  trimName: string;
  exShowroomPriceInr: number;
  currency: string;
  features: NestedCatalogVariantFeatures;
}

export interface NestedCatalogCarLine {
  id: string;
  modelName: string;
  marketingName: string;
  category: string;
  bodyType: string;
  modelYear: number;
  isFacelift: boolean;
  faceliftYear: number | null;
  faceliftNotes: string | null;
  isNewGeneration: boolean;
  description: string;
  seatingCapacity?: number;
  colorsAvailable: string[];
  imageUrl: string;
  specifications: Record<string, unknown>;
  features: CarFeatures;
  variants: NestedCatalogVariant[];
  ratingsEditorial: CarRatings;
}

export interface NestedCatalogManufacturer {
  id: string;
  companyLegalName: string;
  brandDisplayName: string;
  countryOfOrigin: string;
  cars: NestedCatalogCarLine[];
}

export interface IndianNestedAutoCatalog2026 {
  meta: {
    schemaVersion: string;
    market: string;
    currency: string;
    lastUpdated: string;
    dataModelYearLabel: string;
    totalManufacturers: number;
    totalCarLines: number;
    totalVariants: number;
    sourcesNote: string;
    disclaimer: string;
  };
  manufacturers: NestedCatalogManufacturer[];
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
