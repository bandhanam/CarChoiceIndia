"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Car } from "@/types";
import {
  CARS,
  BRANDS,
  BRAND_LOGOS,
  formatPrice,
  getBrandGroups,
} from "@/lib/car-data";

interface SelectedItem {
  carId: string;
  variantName?: string;
}

interface MobileBrowseProps {
  selectedItems: SelectedItem[];
  onToggle: (carId: string, variantName?: string) => void;
  onSwitchToCompare: () => void;
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
  selectedItems,
  onToggle,
  onSwitchToCompare,
}: MobileBrowseProps) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activePriceIdx, setActivePriceIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const brandGroups = useMemo(() => getBrandGroups(), []);

  const filteredCars = useMemo(() => {
    const priceFilter = PRICE_CHIPS[activePriceIdx];
    let cars = activeBrand
      ? CARS.filter((c) => c.brand === activeBrand)
      : CARS;

    if (priceFilter.max !== Infinity || priceFilter.min !== 0) {
      cars = cars.filter(
        (c) => c.price >= priceFilter.min && c.price <= priceFilter.max
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cars = cars.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    return cars;
  }, [activeBrand, activePriceIdx, searchQuery]);

  const isSelected = (carId: string) =>
    selectedItems.some((item) => item.carId === carId && !item.variantName);

  const selectedCars = useMemo(() => {
    return selectedItems
      .map((item) => CARS.find((c) => c.id === item.carId))
      .filter((c): c is Car => c !== null);
  }, [selectedItems]);

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

      {/* Selected cars strip */}
      {selectedItems.length > 0 && (
        <div className="mob-selected-strip">
          <div className="mob-selected-scroll">
            {selectedCars.map((car) => (
              <div key={car.id} className="mob-selected-thumb">
                <Image
                  src={car.imageUrl}
                  alt={car.name}
                  width={48}
                  height={48}
                  className="mob-selected-img"
                  unoptimized
                />
                <button
                  className="mob-selected-remove"
                  onClick={() => onToggle(car.id)}
                  aria-label={`Remove ${car.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button className="mob-compare-link" onClick={onSwitchToCompare}>
            Compare {selectedItems.length}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Brand logo pills */}
      <div className="mob-brand-pills">
        <button
          className={`mob-brand-pill ${activeBrand === null ? "active" : ""}`}
          onClick={() => setActiveBrand(null)}
        >
          <span className="mob-brand-pill-text">All</span>
        </button>
        {brandGroups.map((group) => (
          <button
            key={group.brand.name}
            className={`mob-brand-pill ${activeBrand === group.brand.name ? "active" : ""}`}
            onClick={() =>
              setActiveBrand(
                activeBrand === group.brand.name ? null : group.brand.name
              )
            }
          >
            {BRAND_LOGOS[group.brand.name] ? (
              <Image
                src={BRAND_LOGOS[group.brand.name]}
                alt={group.brand.name}
                width={24}
                height={24}
                className="mob-brand-pill-logo"
                unoptimized
              />
            ) : (
              <span className="mob-brand-pill-emoji">{group.brand.emoji}</span>
            )}
            <span className="mob-brand-pill-text">{group.brand.name}</span>
          </button>
        ))}
      </div>

      {/* Cars grid */}
      <div className="mob-cars-grid">
        {filteredCars.length === 0 ? (
          <div className="mob-empty">
            <p>No cars found</p>
          </div>
        ) : (
          filteredCars.map((car) => {
            const selected = isSelected(car.id);
            return (
              <button
                key={car.id}
                className={`mob-car-card ${selected ? "selected" : ""}`}
                onClick={() => onToggle(car.id)}
                disabled={!selected && selectedItems.length >= 5}
                style={{ "--card-accent": car.color } as React.CSSProperties}
              >
                <div className="mob-car-img-wrap">
                  <Image
                    src={car.imageUrl}
                    alt={car.name}
                    width={180}
                    height={110}
                    className="mob-car-img"
                    unoptimized
                  />
                  {selected && (
                    <div className="mob-car-check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </div>
                  )}
                  <span className="mob-car-category">{car.category}</span>
                </div>
                <div className="mob-car-info">
                  <p className="mob-car-name">{car.model}</p>
                  <p className="mob-car-brand">{car.brand}</p>
                  <p className="mob-car-price">{formatPrice(car.price)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
