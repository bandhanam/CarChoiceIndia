import { Car, CarsDataset, BrandMeta, BrandGroup } from "@/types";
import carsJson from "../../public/data/cars.json";

const dataset = carsJson as CarsDataset;

export const CARS: Car[] = dataset.cars;
export const BRANDS: BrandMeta[] = dataset.brands;

export const BRAND_LOGOS: Record<string, string> = {
  Tata: "/images/brands/Tata.jpeg",
  Hyundai: "/images/brands/hyundai.jpeg",
  Mahindra: "/images/brands/mahinda.jpeg",
  "Maruti Suzuki": "/images/brands/Maruti Suzuki.jpeg",
  Kia: "/images/brands/kia.jpeg",
  Toyota: "/images/brands/Toyota.jpeg",
  Honda: "/images/brands/Honda.jpeg",
  Skoda: "/images/brands/skoda.jpeg",
  Volkswagen: "/images/brands/valksvegon.jpeg",
  Renault: "/images/brands/renault.jpeg",
  BMW: "/images/brands/BMW.jpeg",
  "Mercedes-Benz": "/images/brands/benz.jpeg",
  Tesla: "/images/brands/Tesla.jpeg",
  Ford: "/images/brands/ford.jpeg",
  Chevrolet: "/images/brands/chervrolet.jpeg",
  Ferrari: "/images/brands/ferari.jpeg",
  Jaguar: "/images/brands/jaguar.jpeg",
  Jeep: "/images/brands/Jeep.jpeg",
  "Land Rover": "/images/brands/landrover (1).jpeg",
  Mini: "/images/brands/mini.jpeg",
  Mitsubishi: "/images/brands/Mistubishi.jpeg",
  Citroen: "/images/brands/citroen.jpeg",
  Datsun: "/images/brands/datsun.jpeg",
  Volvo: "/images/brands/valvo.jpeg",
};

export function getCarById(id: string): Car | undefined {
  return CARS.find((car) => car.id === id);
}

export function getBrandGroups(): BrandGroup[] {
  return BRANDS.map((brand) => ({
    brand,
    cars: CARS.filter((c) => c.brand === brand.name),
  })).filter((g) => g.cars.length > 0);
}

export function getBrandMeta(brandName: string): BrandMeta | undefined {
  return BRANDS.find((b) => b.name === brandName);
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
