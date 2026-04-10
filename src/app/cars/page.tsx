"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/car-data";
import { useCarDataset } from "@/context/CarDatasetContext";

export default function AllCarsPage() {
  const { cars: CARS, brands: BRANDS } = useCarDataset();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(CARS.map((car) => car.category));
    return Array.from(cats).sort();
  }, []);

  // Get all brands
  const brands = useMemo(() => {
    return BRANDS.map((b) => b.name).sort();
  }, []);

  // Filter cars
  const filteredCars = useMemo(() => {
    return CARS.filter((car) => {
      // Search query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        car.name.toLowerCase().includes(query) ||
        car.brand.toLowerCase().includes(query) ||
        car.category.toLowerCase().includes(query) ||
        car.description.toLowerCase().includes(query);

      // Brand filter
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(car.brand);

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(car.category);

      // Price filter (in lakhs)
      const carPriceLakhs = car.price / 100000;
      const matchesPrice =
        carPriceLakhs >= priceRange[0] && carPriceLakhs <= priceRange[1];

      return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedBrands, selectedCategories, priceRange]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([0, 100]);
  };

  return (
    <div className="all-cars-page">
      <header className="all-cars-header">
        <div>
          <Link href="/" className="back-link">
            ← Back to AI Selector
          </Link>
          <h1 className="all-cars-title">Latest Cars Collection</h1>
          <p className="all-cars-subtitle">
            Complete list of {filteredCars.length} cars with images, specs & features
          </p>
        </div>
      </header>

      {/* Global Search & Filters */}
      <div className="all-cars-filters">
        <div className="filter-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search cars by name, brand, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="search-clear"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="filter-toggle-btn"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
          <span className="filter-toggle-icon">{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {showAdvanced && (
          <div className="filter-advanced">
            {/* Brand Filter */}
            <div className="filter-group">
              <h3 className="filter-group-title">Brands</h3>
              <div className="filter-chips">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`filter-chip ${
                      selectedBrands.includes(brand) ? "active" : ""
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h3 className="filter-group-title">Categories</h3>
              <div className="filter-chips">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`filter-chip ${
                      selectedCategories.includes(category) ? "active" : ""
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <h3 className="filter-group-title">
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} Lakh
              </h3>
              <div className="filter-range">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  className="range-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="range-slider"
                />
              </div>
            </div>

            {(selectedBrands.length > 0 ||
              selectedCategories.length > 0 ||
              priceRange[0] > 0 ||
              priceRange[1] < 100) && (
              <button onClick={clearFilters} className="filter-clear-btn">
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="all-cars-list">
        {filteredCars.map((car, index) => (
          <article
            key={car.id}
            className="all-car-card-new fade-in"
            style={
              {
                "--card-accent": car.color,
                animationDelay: `${index * 0.05}s`,
              } as React.CSSProperties
            }
          >
            {/* Section 1: Image (Left) */}
            <div className="all-car-image-col">
              <div className="all-car-image-wrapper">
                <Image
                  src={car.imageUrl}
                  alt={car.name}
                  width={400}
                  height={225}
                  className="all-car-image-compact"
                />
                <span
                  className="all-car-badge-category-compact"
                  style={{ background: car.color }}
                >
                  {car.category}
                </span>
              </div>
            </div>

            {/* Section 2: Basic Details (Middle) */}
            <div className="all-car-details-col">
              <div className="all-car-header-compact">
                <h2 className="all-car-name-compact">{car.name}</h2>
                <p className="all-car-brand-compact">by {car.brand}</p>
              </div>

              <p className="all-car-price-compact">{formatPrice(car.price)}</p>

              <p className="all-car-description-compact">{car.description}</p>

              <div className="all-car-specs-compact">
                <div className="spec-item-compact">
                  <span className="spec-label-compact">💪 Power</span>
                  <span className="spec-value-compact">{car.specs.horsepower} HP</span>
                </div>
                <div className="spec-item-compact">
                  <span className="spec-label-compact">🔄 Torque</span>
                  <span className="spec-value-compact">{car.specs.torque}</span>
                </div>
                <div className="spec-item-compact">
                  <span className="spec-label-compact">⛽ {car.specs.fuelType === "Electric" ? "Range" : "Mileage"}</span>
                  <span className="spec-value-compact">
                    {car.specs.fuelType === "Electric"
                      ? `${car.specs.mileage} km`
                      : `${car.specs.mileage} km/l`}
                  </span>
                </div>
                <div className="spec-item-compact">
                  <span className="spec-label-compact">🏎️ Transmission</span>
                  <span className="spec-value-compact">{car.specs.transmission}</span>
                </div>
              </div>

              <div className="all-car-ratings-compact">
                <RatingPillCompact label="Performance" value={car.ratings.performance} color={car.color} />
                <RatingPillCompact label="Safety" value={car.ratings.safety} color={car.color} />
                <RatingPillCompact label="Comfort" value={car.ratings.comfort} color={car.color} />
                <RatingPillCompact label="Technology" value={car.ratings.technology} color={car.color} />
              </div>
            </div>

            {/* Section 3: Extended Details (Right) */}
            <div className="all-car-extended-col">
              <div className="extended-specs">
                <h4 className="extended-title">Full Specifications</h4>
                <div className="extended-spec-list">
                  <div className="extended-spec-item">
                    <span className="extended-spec-label">Engine</span>
                    <span className="extended-spec-value">{car.specs.engine}</span>
                  </div>
                  <div className="extended-spec-item">
                    <span className="extended-spec-label">Drivetrain</span>
                    <span className="extended-spec-value">{car.specs.drivetrain}</span>
                  </div>
                  <div className="extended-spec-item">
                    <span className="extended-spec-label">0–100 km/h</span>
                    <span className="extended-spec-value">{car.specs.acceleration}s</span>
                  </div>
                  <div className="extended-spec-item">
                    <span className="extended-spec-label">Top Speed</span>
                    <span className="extended-spec-value">{car.specs.topSpeed} km/h</span>
                  </div>
                </div>
              </div>

              <div className="extended-features">
                <h4 className="extended-title">Key Features</h4>
                <div className="extended-feature-grid">
                  <FeatureBlockCompact
                    icon="🛡️"
                    title="Safety"
                    items={car.features.safety.slice(0, 3)}
                    color={car.color}
                  />
                  <FeatureBlockCompact
                    icon="📱"
                    title="Technology"
                    items={car.features.technology.slice(0, 3)}
                    color={car.color}
                  />
                </div>
              </div>
            </div>
            <div className="all-car-detail-link-wrap">
              <Link href={`/cars/${car.id}`} className="all-car-detail-link">
                View Full Details →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="all-cars-cta">
        <Link href="/" className="all-cars-cta-btn">
          🤖 Compare & Find Winner with AI →
        </Link>
      </div>
    </div>
  );
}

function FeatureBlockCompact({
  icon,
  title,
  items,
  color,
}: {
  icon: string;
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="feature-block-compact">
      <h5 className="feature-block-title-compact">
        {icon} {title}
      </h5>
      <ul className="feature-list-compact">
        {items.map((item) => (
          <li key={item} className="feature-item-compact" style={{ borderLeftColor: `${color}80` }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RatingPillCompact({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rating-pill-compact">
      <span className="rating-pill-label-compact">{label}</span>
      <span className="rating-pill-value-compact" style={{ color }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}
