/** Structured response from POST /api/openai/car-estimate (experimental). */
export interface CarMarketEstimate {
  disclaimer: string;
  currency: "INR";
  estimatedExShowroomMinInr: number;
  estimatedExShowroomMaxInr: number;
  highlights: string[];
  featureNotes: string[];
  confidenceNote: string;
  asOfHint: string;
}
