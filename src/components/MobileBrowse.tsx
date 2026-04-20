"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, BrandMeta } from "@/types";
import {
  BRAND_LOGOS,
  formatPrice,
  getAllBrandNamesFrom,
  STARTING_TRIM_LABEL,
} from "@/lib/car-data";
import CarPhoto from "@/components/CarPhoto";

interface SelectedItem {
  carId: string;
  variantName?: string;
}

interface MobileBrowseProps {
  cars: Car[];
  brands: BrandMeta[];
  selectedItems: SelectedItem[];
  onToggle: (carId: string, variantName?: string) => void;
}

const PRICE_CHIPS = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under 5L", min: 0, max: 500000 },
  { label: "5-10L", min: 500000, max: 1000000 },
  { label: "10-15L", min: 1000000, max: 1500000 },
  { label: "15-25L", min: 1500000, max: 2500000 },
  { label: "25L+", min: 2500000, max: Infinity },
];

export default function MobileBrowse({
  cars,
  brands,
  selectedItems,
  onToggle,
}: MobileBrowseProps) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activePriceIdx, setActivePriceIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCarId, setExpandedCarId] = useState<string | null>(null);

  const allBrands = useMemo(
    () =>
      [
        ...new Set([
          ...getAllBrandNamesFrom(cars, brands),
          ...Object.keys(BRAND_LOGOS),
        ]),
      ],
    [cars, brands]
  );

  const filteredCars = useMemo(() => {
    const priceFilter = PRICE_CHIPS[activePriceIdx];
    let list = activeBrand
      ? cars.filter((c) => c.brand === activeBrand)
      : cars;

    if (priceFilter.max !== Infinity || priceFilter.min !== 0) {
      list = list.filter(
        (c) => c.price >= priceFilter.min && c.price <= priceFilter.max
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeBrand, activePriceIdx, searchQuery, cars]);

  const isStartingTrimSelected = (carId: string) =>
    selectedItems.some((item) => item.carId === carId && !item.variantName);

  const isVariantSelected = (carId: string, variantName: string) =>
    selectedItems.some(
      (item) => item.carId === carId && item.variantName === variantName
    );

  const anySelectedForCar = (carId: string) =>
    selectedItems.some((item) => item.carId === carId);

  const selectedCountForCar = (carId: string) =>
    selectedItems.filter((item) => item.carId === carId).length;

  return (
    <div className="mob-browse">
      {/* Search bar */}
      <div className="mob-search-bar">
        <svg className="mob-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mob-search-input"
        />
        {searchQuery && (
          <button className="mob-search-clear" onClick={() => setSearchQuery("")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Price quick-filter chips */}
      <div className="mob-price-chips">
        {PRICE_CHIPS.map((chip, idx) => (
          <button
            key={chip.label}
            className={`mob-price-chip ${activePriceIdx === idx ? "active" : ""}`}
            onClick={() => setActivePriceIdx(idx)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Brand logo pills */}
      <div className="mob-brand-pills">
        <button
          className={`mob-brand-pill ${activeBrand === null ? "active" : ""}`}
          onClick={() => setActiveBrand(null)}
        >
          <span className="mob-brand-pill-text">All</span>
        </button>
        {allBrands.map((brandName) => {
          const carCount = cars.filter((c) => c.brand === brandName).length;
          return (
            <button
              key={brandName}
              className={`mob-brand-pill ${activeBrand === brandName ? "active" : ""} ${carCount === 0 ? "no-cars" : ""}`}
              onClick={() =>
                setActiveBrand(activeBrand === brandName ? null : brandName)
              }
            >
              {BRAND_LOGOS[brandName] ? (
                <Image
                  src={BRAND_LOGOS[brandName]}
                  alt={brandName}
                  width={24}
                  height={24}
                  className="mob-brand-pill-logo"
                  unoptimized
                />
              ) : (
                <span className="mob-brand-pill-emoji">🚗</span>
              )}
              <span className="mob-brand-pill-text">{brandName}</span>
              {carCount === 0 && <span className="mob-brand-pill-soon">soon</span>}
            </button>
          );
        })}
      </div>

      {/* Cars grid */}
      <div className="mob-cars-grid">
        {filteredCars.length === 0 ? (
          <div className="mob-empty">
            {activeBrand && cars.filter((c) => c.brand === activeBrand).length === 0 ? (
              <>
                <p style={{ fontSize: 32, marginBottom: 8 }}>🚧</p>
                <p><strong>{activeBrand}</strong> cars coming soon!</p>
              </>
            ) : (
              <p>No cars found</p>
            )}
          </div>
        ) : (
          filteredCars.map((car) => {
            const startingTrimSelected = isStartingTrimSelected(car.id);
            const hasVariants = car.variants && car.variants.length > 0;
            const isExpanded = expandedCarId === car.id;
            const selCount = selectedCountForCar(car.id);

            return (
              <div
                key={car.id}
                className={`mob-car-card-wrap ${anySelectedForCar(car.id) ? "has-selection" : ""}`}
                style={{ "--card-accent": car.color } as React.CSSProperties}
              >
                <button
                  className={`mob-car-card ${startingTrimSelected ? "selected" : ""}`}
                  onClick={() => {
                    if (hasVariants) {
                      setExpandedCarId(isExpanded ? null : car.id);
                    } else {
                      onToggle(car.id);
                    }
                  }}
                  disabled={!startingTrimSelected && !hasVariants && selectedItems.length >= 5}
                >
                  <div className="mob-car-img-wrap">
                    <CarPhoto
                      car={car}
                      alt={car.name}
                      width={180}
                      height={110}
                      className="mob-car-img"
                    />
                    {startingTrimSelected && (
                      <div className="mob-car-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      </div>
                    )}
                    {selCount > 0 && !startingTrimSelected && (
                      <div className="mob-car-sel-count">{selCount}</div>
                    )}
                    <span className="mob-car-category">{car.category}</span>
                  </div>
                <div className="mob-car-info">
                  <p className="mob-car-name">{car.model}</p>
                  <p className="mob-car-brand">{car.brand}</p>
                  <div className="mob-car-info-row">
                    <p className="mob-car-price">{formatPrice(car.price)}</p>
                    {hasVariants && (
                      <span className="mob-car-variants-badge">
                        {car.variants!.length} var
                        <svg
                          width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/cars/${car.id}`}
                    className="mob-car-details-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details →
                  </Link>
                </div>
                </button>

                {/* Variant dropdown */}
                {hasVariants && isExpanded && (
                  <div className="mob-variant-list">
                    {/* Starting trim — list price, same model line */}
                    <button
                      className={`mob-variant-row ${startingTrimSelected ? "selected" : ""}`}
                      onClick={() => onToggle(car.id)}
                      disabled={!startingTrimSelected && selectedItems.length >= 5}
                    >
                      <span className={`mob-variant-check ${startingTrimSelected ? "checked" : ""}`}>
                        {startingTrimSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </span>
                      <span className="mob-variant-name">{STARTING_TRIM_LABEL}</span>
                      <span className="mob-variant-price">{formatPrice(car.price)}</span>
                    </button>
                    {car.variants!.map((v) => {
                      const vSelected = isVariantSelected(car.id, v.name);
                      return (
                        <button
                          key={v.name}
                          className={`mob-variant-row ${vSelected ? "selected" : ""}`}
                          onClick={() => onToggle(car.id, v.name)}
                          disabled={!vSelected && selectedItems.length >= 5}
                        >
                          <span className={`mob-variant-check ${vSelected ? "checked" : ""}`}>
                            {vSelected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            )}
                          </span>
                          <span className="mob-variant-name">{v.name}</span>
                          <span className="mob-variant-price">{formatPrice(v.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
