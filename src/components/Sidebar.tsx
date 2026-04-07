"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, BrandGroup } from "@/types";
import { formatPrice, getBrandGroups, BRAND_LOGOS, CARS } from "@/lib/car-data";

interface SelectedItem {
  carId: string;
  variantName?: string;
}

interface SidebarProps {
  cars: Car[];
  selectedItems: SelectedItem[];
  onToggle: (carId: string, variantName?: string) => void;
  onRunAI: () => void;
  isAnalyzing: boolean;
  mobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPriceLakh: number;
}

export default function Sidebar({
  cars,
  selectedItems,
  onToggle,
  onRunAI,
  isAnalyzing,
  mobileMenuOpen = false,
  onCloseMobile,
  priceRange,
  onPriceRangeChange,
  maxPriceLakh,
}: SidebarProps) {
  const canAnalyze = selectedItems.length >= 2;
  const brandGroups = useMemo(() => getBrandGroups(), []);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(
    () => new Set(brandGroups.map((g) => g.brand.name))
  );
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");

  const toggleBrand = (brandName: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brandName)) next.delete(brandName);
      else next.add(brandName);
      return next;
    });
  };

  const toggleVariants = (carId: string) => {
    setExpandedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(carId)) next.delete(carId);
      else next.add(carId);
      return next;
    });
  };

  const isItemSelected = (carId: string, variantName?: string) => {
    return selectedItems.some(
      (item) => item.carId === carId && item.variantName === variantName
    );
  };

  const getCarSelectionCount = (carId: string) => {
    return selectedItems.filter((item) => item.carId === carId).length;
  };

  const toggleAllBrandCars = (group: BrandGroup) => {
    const groupCarIds = group.cars.map((c) => c.id);
    const anySelected = selectedItems.some((item) =>
      groupCarIds.includes(item.carId)
    );

    if (anySelected) {
      selectedItems
        .filter((item) => groupCarIds.includes(item.carId))
        .forEach((item) => onToggle(item.carId, item.variantName));
    } else {
      group.cars.forEach((car) => {
        if (selectedItems.length < 5) {
          onToggle(car.id);
        }
      });
    }
  };

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const minPrice = priceRange[0] * 100000;
    const maxPrice = priceRange[1] * 100000;

    return brandGroups
      .map((g) => ({
        ...g,
        cars: g.cars.filter((c) => {
          const matchesSearch =
            !q ||
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.brand.toLowerCase().includes(q) ||
            c.variants?.some((v) => v.name.toLowerCase().includes(q));

          const lowestPrice = c.variants && c.variants.length > 0
            ? Math.min(c.price, ...c.variants.map((v) => v.price))
            : c.price;
          const highestPrice = c.variants && c.variants.length > 0
            ? Math.max(c.price, ...c.variants.map((v) => v.price))
            : c.price;

          const matchesPrice = highestPrice >= minPrice && lowestPrice <= maxPrice;

          return matchesSearch && matchesPrice;
        }),
      }))
      .filter((g) => g.cars.length > 0);
  }, [brandGroups, searchQuery, priceRange]);

  const getBrandSelectionState = (group: BrandGroup) => {
    const ids = group.cars.map((c) => c.id);
    const selectedCount = ids.filter((id) =>
      selectedItems.some((item) => item.carId === id)
    ).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === ids.length) return "all";
    return "partial";
  };

  const handleItemToggle = (carId: string, variantName?: string) => {
    onToggle(carId, variantName);
    if (onCloseMobile && window.innerWidth <= 768) {
      setTimeout(() => onCloseMobile(), 300);
    }
  };

  const totalFiltered = filteredGroups.reduce((sum, g) => sum + g.cars.length, 0);
  const isFiltered = priceRange[0] > 0 || priceRange[1] < maxPriceLakh;

  return (
    <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <span className="sidebar-icon">🚗</span>
          Car Brands
        </h2>
        <p className="sidebar-subtitle">
          {brandGroups.length} brands · {cars.length} cars
        </p>
      </div>

      <div className="sidebar-action-top">
        <p className="selected-count">
          {selectedItems.length} of 5 max selected
        </p>
        <button
          onClick={onRunAI}
          disabled={!canAnalyze || isAnalyzing}
          className="find-winner-button"
        >
          {isAnalyzing ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>🏆 Find Winner</>
          )}
        </button>
        {!canAnalyze && selectedItems.length > 0 && (
          <p className="hint-text">Select at least one more car</p>
        )}
      </div>

      <div className="tree-search-wrap">
        <input
          type="text"
          className="tree-search"
          placeholder="Search cars, brands, variants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="tree-search-clear"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      <div className="sidebar-price-filter">
        <div className="price-filter-header">
          <span className="price-filter-label">Price Range</span>
          <span className="price-filter-value">
            ₹{priceRange[0]}L – ₹{priceRange[1]}L
          </span>
        </div>
        <div className="price-slider-track">
          <input
            type="range"
            min={0}
            max={maxPriceLakh}
            step={1}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < priceRange[1]) onPriceRangeChange([val, priceRange[1]]);
            }}
            className="price-slider price-slider-min"
          />
          <input
            type="range"
            min={0}
            max={maxPriceLakh}
            step={1}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > priceRange[0]) onPriceRangeChange([priceRange[0], val]);
            }}
            className="price-slider price-slider-max"
          />
        </div>
        {isFiltered && (
          <button
            className="price-reset-btn"
            onClick={() => onPriceRangeChange([0, maxPriceLakh])}
          >
            Reset · {totalFiltered} cars
          </button>
        )}
      </div>

      <div className="brand-tree">
        {filteredGroups.map((group) => {
          const isExpanded = expandedBrands.has(group.brand.name);
          const selState = getBrandSelectionState(group);

          return (
            <div key={group.brand.name} className="brand-node">
              <div className="brand-row">
                <button
                  className="brand-expand-btn"
                  onClick={() => toggleBrand(group.brand.name)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg
                    className={`chevron ${isExpanded ? "open" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M4 2L8 6L4 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  className={`brand-checkbox ${selState}`}
                  onClick={() => toggleAllBrandCars(group)}
                  style={{
                    borderColor:
                      selState !== "none"
                        ? group.brand.color
                        : "var(--border)",
                    background:
                      selState === "all" ? group.brand.color : "transparent",
                  }}
                  aria-label={`Toggle all ${group.brand.name} cars`}
                >
                  {selState === "all" && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {selState === "partial" && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5H8" stroke={group.brand.color} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                <button
                  className="brand-label"
                  onClick={() => toggleBrand(group.brand.name)}
                >
                  <div className="brand-logo-wrapper">
                    {BRAND_LOGOS[group.brand.name] ? (
                      <Image
                        src={BRAND_LOGOS[group.brand.name]}
                        alt={`${group.brand.name} logo`}
                        width={32}
                        height={32}
                        className="brand-logo"
                        unoptimized
                      />
                    ) : (
                      <span className="brand-emoji">{group.brand.emoji}</span>
                    )}
                  </div>
                  <span className="brand-name">{group.brand.name}</span>
                  <span className="brand-count">{group.cars.length}</span>
                </button>
              </div>

              {isExpanded && (
                <div className="car-leaves">
                  {group.cars.map((car) => {
                    const baseSelected = isItemSelected(car.id);
                    const hasVariants = car.variants && car.variants.length > 0;
                    const isVariantsOpen = expandedVariants.has(car.id);
                    const selCount = getCarSelectionCount(car.id);

                    return (
                      <div key={car.id} className="car-leaf-wrapper">
                        <div
                          className={`car-leaf-compact ${baseSelected ? "selected" : ""}`}
                          style={
                            baseSelected
                              ? { borderColor: car.color }
                              : undefined
                          }
                        >
                          <button
                            className="car-leaf-select-area"
                            onClick={() => handleItemToggle(car.id)}
                            disabled={!baseSelected && selectedItems.length >= 5}
                            title={`Select ${car.name} (base model)`}
                          >
                            <div
                              className="car-leaf-check-sm"
                              style={
                                baseSelected
                                  ? { background: car.color, borderColor: car.color }
                                  : undefined
                              }
                            >
                              {baseSelected && (
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div className="car-leaf-text">
                              <span className="car-leaf-name">{car.model}</span>
                              <span className="car-leaf-meta">
                                {car.category}
                                <span className="spec-dot">·</span>
                                {car.specs.horsepower} HP
                                <span className="spec-dot">·</span>
                                {car.specs.fuelType === "Electric"
                                  ? `${car.specs.mileage} km`
                                  : `${car.specs.mileage} km/l`}
                              </span>
                            </div>
                            <span className="car-leaf-price-sm">{formatPrice(car.price)}</span>
                          </button>

                          {hasVariants && (
                            <button
                              className="variant-toggle-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVariants(car.id);
                              }}
                              title={`${car.variants!.length} variants`}
                            >
                              {selCount > 0 && (
                                <span className="variant-sel-badge" style={{ background: car.color }}>
                                  {selCount}
                                </span>
                              )}
                              <span className="variant-count">{car.variants!.length}</span>
                              <svg
                                className={`chevron-sm ${isVariantsOpen ? "open" : ""}`}
                                width="10"
                                height="10"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M4 2L8 6L4 10"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          )}
                        </div>

                        {hasVariants && isVariantsOpen && (
                          <div className="variant-list">
                            {car.variants!.map((v) => {
                              const vSelected = isItemSelected(car.id, v.name);
                              return (
                                <button
                                  key={v.name}
                                  className={`variant-row variant-selectable ${vSelected ? "variant-selected" : ""}`}
                                  onClick={() => handleItemToggle(car.id, v.name)}
                                  disabled={!vSelected && selectedItems.length >= 5}
                                  style={vSelected ? { borderColor: car.color } : undefined}
                                >
                                  <div
                                    className="variant-check"
                                    style={
                                      vSelected
                                        ? { background: car.color, borderColor: car.color }
                                        : undefined
                                    }
                                  >
                                    {vSelected && (
                                      <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="variant-name">{v.name}</span>
                                  <span className="variant-price">{formatPrice(v.price)}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="tree-empty">
            <p>No cars match your filters</p>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <Link href="/cars" className="all-cars-link">
          📋 View All Cars
        </Link>
      </div>
    </aside>
  );
}
