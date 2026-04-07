import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CarsDataset, Car } from "@/types";

const DATA_PATH = path.join(process.cwd(), "public", "data", "cars.json");

function readDataset(): CarsDataset {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDataset(data: CarsDataset) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const data = readDataset();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const car: Car = await request.json();

    if (!car.id || !car.name || !car.brand) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, brand" },
        { status: 400 }
      );
    }

    const data = readDataset();

    if (data.cars.some((c) => c.id === car.id)) {
      return NextResponse.json(
        { error: `Car with id "${car.id}" already exists` },
        { status: 409 }
      );
    }

    data.cars.push(car);
    writeDataset(data);

    return NextResponse.json({ success: true, car }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add car" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const car: Car = await request.json();

    if (!car.id) {
      return NextResponse.json({ error: "Missing car id" }, { status: 400 });
    }

    const data = readDataset();
    const idx = data.cars.findIndex((c) => c.id === car.id);

    if (idx === -1) {
      return NextResponse.json(
        { error: `Car "${car.id}" not found` },
        { status: 404 }
      );
    }

    data.cars[idx] = car;
    writeDataset(data);

    return NextResponse.json({ success: true, car });
  } catch {
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const cars: Car[] = Array.isArray(body) ? body : body.cars;

    if (!Array.isArray(cars) || cars.length === 0) {
      return NextResponse.json(
        { error: "Request body must be a JSON array of Car objects (or { cars: [...] })" },
        { status: 400 }
      );
    }

    const data = readDataset();
    const existingIds = new Set(data.cars.map((c) => c.id));

    const results = { added: 0, skipped: 0, errors: [] as string[] };

    for (const car of cars) {
      if (!car.id || !car.name || !car.brand) {
        results.errors.push(`Skipped entry: missing id/name/brand (got name="${car.name || ""}")`);
        results.skipped++;
        continue;
      }

      if (existingIds.has(car.id)) {
        results.skipped++;
        continue;
      }

      data.cars.push(car);
      existingIds.add(car.id);
      results.added++;
    }

    if (results.added > 0) {
      writeDataset(data);
    }

    return NextResponse.json({
      success: true,
      total: cars.length,
      ...results,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to bulk import cars" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing car id" }, { status: 400 });
    }

    const data = readDataset();
    const idx = data.cars.findIndex((c) => c.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { error: `Car "${id}" not found` },
        { status: 404 }
      );
    }

    const removed = data.cars.splice(idx, 1)[0];
    writeDataset(data);

    return NextResponse.json({ success: true, removed });
  } catch {
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}
