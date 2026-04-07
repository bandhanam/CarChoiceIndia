#!/usr/bin/env npx ts-node
/**
 * Car Template Generator
 *
 * Generates a blank JSON template matching the Car interface.
 * Usage:
 *   npx ts-node scripts/generate-car-template.ts "Tata" "Safari EV"
 *   npx ts-node scripts/generate-car-template.ts --brand "Hyundai" --model "Ioniq 5"
 *
 * Output is written to stdout as formatted JSON — pipe it into a file:
 *   npx ts-node scripts/generate-car-template.ts "Kia" "EV9" > kia-ev9.json
 */

interface CarTemplate {
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
  gallery: string[];
  color: string;
  specs: {
    engine: string;
    horsepower: number;
    torque: string;
    transmission: string;
    drivetrain: string;
    fuelType: string;
    mileage: number;
    acceleration: number;
    topSpeed: number;
  };
  features: {
    safety: string[];
    comfort: string[];
    technology: string[];
    exterior: string[];
  };
  ratings: {
    performance: number;
    fuelEfficiency: number;
    safety: number;
    comfort: number;
    technology: number;
    valueForMoney: number;
  };
  variants: { name: string; price: number }[];
  description: string;
  seatingCapacity: number;
  colors: string[];
}

function generateId(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseArgs(args: string[]): { brand: string; model: string } {
  let brand = "";
  let model = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--brand" && args[i + 1]) {
      brand = args[++i];
    } else if (args[i] === "--model" && args[i + 1]) {
      model = args[++i];
    } else if (!brand) {
      brand = args[i];
    } else if (!model) {
      model = args[i];
    }
  }

  return { brand, model };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.error(`
Car Template Generator
======================
Generates a blank car JSON template matching the Car interface.

Usage:
  npx ts-node scripts/generate-car-template.ts <brand> <model>
  npx ts-node scripts/generate-car-template.ts --brand "Hyundai" --model "Ioniq 5"

Examples:
  npx ts-node scripts/generate-car-template.ts "Tata" "Sierra EV"
  npx ts-node scripts/generate-car-template.ts "Kia" "EV9" > kia-ev9.json

Data Sources (for filling in details):
  - CardDekho: https://www.cardekho.com/{brand}/{model}
  - CarWale:   https://www.carwale.com/{brand}-cars/{model}
  - ZigWheels: https://www.zigwheels.com/{brand}-cars/{model}
  - Images:    https://imgd.aeplcdn.com/664x374/n/cw/ec/{id}/{model}-exterior-right-front-three-quarter.jpeg
`);
    process.exit(0);
  }

  const { brand, model } = parseArgs(args);

  if (!brand || !model) {
    console.error("Error: Both brand and model are required.");
    console.error('Usage: npx ts-node scripts/generate-car-template.ts "Brand" "Model"');
    process.exit(1);
  }

  const fullName = `${brand} ${model} 2025`;
  const id = generateId(brand, `${model}-2025`);

  const template: CarTemplate = {
    id,
    name: fullName,
    brand,
    model,
    year: 2025,
    price: 0,
    currency: "INR",
    category: "TODO: e.g. Compact SUV, Sedan, Hatchback",
    imageEmoji: "🚗",
    imageUrl: "TODO: https://imgd.aeplcdn.com/664x374/n/cw/ec/...",
    gallery: [],
    color: "#448aff",
    specs: {
      engine: "TODO: e.g. 1.5L Turbo Petrol",
      horsepower: 0,
      torque: "TODO: e.g. 250 Nm",
      transmission: "TODO: e.g. 6-Speed MT / AT",
      drivetrain: "FWD",
      fuelType: "Petrol",
      mileage: 0,
      acceleration: 0,
      topSpeed: 0,
    },
    features: {
      safety: ["TODO: 6 Airbags", "TODO: ESP", "TODO: ABS with EBD"],
      comfort: ["TODO: Auto Climate Control", "TODO: Push Button Start"],
      technology: ["TODO: Touchscreen", "TODO: Wireless CarPlay/Android Auto"],
      exterior: ["TODO: LED Headlamps", "TODO: Alloy Wheels"],
    },
    ratings: {
      performance: 5.0,
      fuelEfficiency: 5.0,
      safety: 5.0,
      comfort: 5.0,
      technology: 5.0,
      valueForMoney: 5.0,
    },
    variants: [
      { name: "TODO: Base Variant", price: 0 },
      { name: "TODO: Mid Variant", price: 0 },
      { name: "TODO: Top Variant", price: 0 },
    ],
    description: `TODO: One-line description of ${fullName}`,
    seatingCapacity: 5,
    colors: ["TODO: White", "TODO: Black", "TODO: Red"],
  };

  console.log(JSON.stringify(template, null, 2));

  console.error(`\n✅ Template generated for: ${fullName}`);
  console.error(`   ID: ${id}`);
  console.error(`\n📝 Fill in the TODO fields using:`);
  console.error(`   CardDekho: https://www.cardekho.com/${brand.toLowerCase().replace(/\s+/g, "-")}-cars/${model.toLowerCase().replace(/\s+/g, "-")}`);
  console.error(`   CarWale:   https://www.carwale.com/${brand.toLowerCase().replace(/\s+/g, "-")}-cars/${model.toLowerCase().replace(/\s+/g, "-")}`);
}

main();
