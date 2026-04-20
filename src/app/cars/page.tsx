"use client";

import Link from "next/link";
import { useCarDataset } from "@/context/CarDatasetContext";
import { formatPrice } from "@/lib/car-data";
import CarPhoto from "@/components/CarPhoto";

export default function CarsPage() {
  const { cars, brands } = useCarDataset();

  const grouped = brands
    .map((b) => ({
      brand: b,
      models: cars.filter((c) => c.brand === b.name),
    }))
    .filter((g) => g.models.length > 0);

  return (
    <div className="all-cars-page">
      <header className="all-cars-header">
        <div>
          <Link href="/" className="back-link">
            &larr; Back to AI Selector
          </Link>
          <h1 className="all-cars-title">All Cars</h1>
          <p className="all-cars-subtitle">
            {cars.length} models across {brands.length} brands — sourced from
            our curated dataset.
          </p>
        </div>
      </header>

      <div className="all-cars-grid">
        {grouped.map(({ brand, models }) => (
          <section key={brand.name} className="brand-section">
            <h2 className="brand-section-title" style={{ color: brand.color }}>
              {brand.emoji} {brand.name}
              <span className="brand-count"> ({models.length})</span>
            </h2>
            <div className="cars-grid">
              {models.map((car) => (
                <div key={car.id} className="car-card-mini">
                  <CarPhoto
                    car={car}
                    alt={car.name}
                    width={120}
                    height={80}
                    className="car-card-mini-img"
                  />
                  <div className="car-card-mini-info">
                    <h3 className="car-card-mini-name">{car.name}</h3>
                    <p className="car-card-mini-price">
                      From {formatPrice(car.price)}
                    </p>
                    <p className="car-card-mini-spec">
                      {car.specs.engine} &middot; {car.specs.fuelType} &middot;{" "}
                      {car.specs.horsepower} HP
                    </p>
                    {car.variants && car.variants.length > 0 && (
                      <p className="car-card-mini-variants">
                        {car.variants.length} variant
                        {car.variants.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="all-cars-cta">
        <Link href="/" className="all-cars-cta-btn">
          Compare &amp; Find Winner with AI &rarr;
        </Link>
      </div>
    </div>
  );
}
