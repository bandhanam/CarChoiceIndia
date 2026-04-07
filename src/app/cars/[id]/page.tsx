"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCarById, formatPrice, BRAND_LOGOS } from "@/lib/car-data";

export default function CarDetailPage() {
  const params = useParams();
  const car = getCarById(params.id as string);
  const [activeVariant, setActiveVariant] = useState<number | null>(null);

  if (!car) {
    return (
      <div className="car-detail-page">
        <div className="cdp-not-found">
          <p style={{ fontSize: 48 }}>🚗</p>
          <h2>Car not found</h2>
          <Link href="/cars" className="cdp-back-btn">← Back to All Cars</Link>
        </div>
      </div>
    );
  }

  const brandLogo = BRAND_LOGOS[car.brand];
  const displayPrice = activeVariant !== null && car.variants
    ? car.variants[activeVariant].price
    : car.price;
  const displayVariantName = activeVariant !== null && car.variants
    ? car.variants[activeVariant].name
    : "Base Model";

  const ratingEntries: { label: string; key: keyof typeof car.ratings; icon: string }[] = [
    { label: "Performance", key: "performance", icon: "🏎️" },
    { label: "Fuel Efficiency", key: "fuelEfficiency", icon: "⛽" },
    { label: "Safety", key: "safety", icon: "🛡️" },
    { label: "Comfort", key: "comfort", icon: "🛋️" },
    { label: "Technology", key: "technology", icon: "📱" },
    { label: "Value for Money", key: "valueForMoney", icon: "💰" },
  ];

  const featureGroups: { title: string; key: keyof typeof car.features; icon: string; color: string }[] = [
    { title: "Safety", key: "safety", icon: "🛡️", color: "#e53935" },
    { title: "Comfort", key: "comfort", icon: "🛋️", color: "#0d9f6e" },
    { title: "Technology", key: "technology", icon: "📱", color: "#3366ff" },
    { title: "Exterior", key: "exterior", icon: "✨", color: "#e67e22" },
  ];

  return (
    <div className="car-detail-page">
      {/* Navigation */}
      <nav className="cdp-nav">
        <Link href="/cars" className="cdp-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All Cars
        </Link>
        <Link href="/" className="cdp-compare-btn">
          Compare with AI →
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="cdp-hero" style={{ "--car-color": car.color } as React.CSSProperties}>
        <div className="cdp-hero-img-wrap">
          <Image
            src={car.imageUrl}
            alt={car.name}
            width={800}
            height={450}
            className="cdp-hero-img"
            unoptimized
            priority
          />
          <span className="cdp-hero-category" style={{ background: car.color }}>
            {car.category}
          </span>
        </div>

        <div className="cdp-hero-info">
          <div className="cdp-hero-brand-row">
            {brandLogo && (
              <Image
                src={brandLogo}
                alt={car.brand}
                width={32}
                height={32}
                className="cdp-brand-logo"
                unoptimized
              />
            )}
            <span className="cdp-brand-name">{car.brand}</span>
            <span className="cdp-year">{car.year}</span>
          </div>
          <h1 className="cdp-car-name">{car.name}</h1>
          <p className="cdp-description">{car.description}</p>
          <div className="cdp-price-row">
            <p className="cdp-price">{formatPrice(displayPrice)}</p>
            {activeVariant !== null && (
              <span className="cdp-variant-tag">{displayVariantName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Variants Section */}
      {car.variants && car.variants.length > 0 && (
        <section className="cdp-section">
          <h2 className="cdp-section-title">
            <span>🔀</span> Variants ({car.variants.length})
          </h2>
          <div className="cdp-variants-grid">
            <button
              className={`cdp-variant-card ${activeVariant === null ? "active" : ""}`}
              onClick={() => setActiveVariant(null)}
            >
              <span className="cdp-variant-name">Base Model</span>
              <span className="cdp-variant-price">{formatPrice(car.price)}</span>
            </button>
            {car.variants.map((v, idx) => (
              <button
                key={v.name}
                className={`cdp-variant-card ${activeVariant === idx ? "active" : ""}`}
                onClick={() => setActiveVariant(idx)}
              >
                <span className="cdp-variant-name">{v.name}</span>
                <span className="cdp-variant-price">{formatPrice(v.price)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Quick Specs */}
      <section className="cdp-section">
        <h2 className="cdp-section-title">
          <span>⚙️</span> Specifications
        </h2>
        <div className="cdp-specs-grid">
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">💪</span>
            <span className="cdp-spec-label">Power</span>
            <span className="cdp-spec-value">{car.specs.horsepower} HP</span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">🔄</span>
            <span className="cdp-spec-label">Torque</span>
            <span className="cdp-spec-value">{car.specs.torque}</span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">🏗️</span>
            <span className="cdp-spec-label">Engine</span>
            <span className="cdp-spec-value">{car.specs.engine}</span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">🏎️</span>
            <span className="cdp-spec-label">Transmission</span>
            <span className="cdp-spec-value">{car.specs.transmission}</span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">⛽</span>
            <span className="cdp-spec-label">{car.specs.fuelType === "Electric" ? "Range" : "Mileage"}</span>
            <span className="cdp-spec-value">
              {car.specs.fuelType === "Electric" ? `${car.specs.mileage} km` : `${car.specs.mileage} km/l`}
            </span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">🚀</span>
            <span className="cdp-spec-label">0-100 km/h</span>
            <span className="cdp-spec-value">{car.specs.acceleration}s</span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">📏</span>
            <span className="cdp-spec-label">Top Speed</span>
            <span className="cdp-spec-value">{car.specs.topSpeed} km/h</span>
          </div>
          <div className="cdp-spec-card">
            <span className="cdp-spec-icon">🔧</span>
            <span className="cdp-spec-label">Drivetrain</span>
            <span className="cdp-spec-value">{car.specs.drivetrain}</span>
          </div>
          {car.seatingCapacity && (
            <div className="cdp-spec-card">
              <span className="cdp-spec-icon">👥</span>
              <span className="cdp-spec-label">Seating</span>
              <span className="cdp-spec-value">{car.seatingCapacity} seats</span>
            </div>
          )}
          {car.bootSpace && (
            <div className="cdp-spec-card">
              <span className="cdp-spec-icon">🧳</span>
              <span className="cdp-spec-label">Boot Space</span>
              <span className="cdp-spec-value">{car.bootSpace}</span>
            </div>
          )}
          {car.groundClearance && (
            <div className="cdp-spec-card">
              <span className="cdp-spec-icon">📐</span>
              <span className="cdp-spec-label">Ground Clearance</span>
              <span className="cdp-spec-value">{car.groundClearance}</span>
            </div>
          )}
          {car.kerbWeight && (
            <div className="cdp-spec-card">
              <span className="cdp-spec-icon">⚖️</span>
              <span className="cdp-spec-label">Kerb Weight</span>
              <span className="cdp-spec-value">{car.kerbWeight}</span>
            </div>
          )}
        </div>
      </section>

      {/* Ratings */}
      <section className="cdp-section">
        <h2 className="cdp-section-title">
          <span>⭐</span> Ratings
        </h2>
        <div className="cdp-ratings-list">
          {ratingEntries.map((r) => {
            const val = car.ratings[r.key];
            const pct = (val / 10) * 100;
            return (
              <div key={r.key} className="cdp-rating-row">
                <span className="cdp-rating-icon">{r.icon}</span>
                <span className="cdp-rating-label">{r.label}</span>
                <div className="cdp-rating-bar">
                  <div
                    className="cdp-rating-fill"
                    style={{ width: `${pct}%`, background: car.color }}
                  />
                </div>
                <span className="cdp-rating-value" style={{ color: car.color }}>
                  {val.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="cdp-section">
        <h2 className="cdp-section-title">
          <span>✅</span> Features
        </h2>
        <div className="cdp-features-grid">
          {featureGroups.map((group) => {
            const items = car.features[group.key];
            if (!items || items.length === 0) return null;
            return (
              <div key={group.key} className="cdp-feature-group">
                <h3 className="cdp-feature-group-title">
                  {group.icon} {group.title}
                </h3>
                <ul className="cdp-feature-list">
                  {items.map((item) => (
                    <li key={item} className="cdp-feature-item" style={{ borderLeftColor: group.color }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Colors */}
      {car.colors && car.colors.length > 0 && (
        <section className="cdp-section">
          <h2 className="cdp-section-title">
            <span>🎨</span> Available Colors
          </h2>
          <div className="cdp-colors-list">
            {car.colors.map((c) => (
              <span key={c} className="cdp-color-chip">{c}</span>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {car.gallery && car.gallery.length > 0 && (
        <section className="cdp-section">
          <h2 className="cdp-section-title">
            <span>📸</span> Gallery
          </h2>
          <div className="cdp-gallery">
            {car.gallery.map((url, idx) => (
              <div key={idx} className="cdp-gallery-item">
                <Image
                  src={url}
                  alt={`${car.name} gallery ${idx + 1}`}
                  width={600}
                  height={340}
                  className="cdp-gallery-img"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="cdp-cta">
        <Link href="/" className="cdp-cta-btn">
          🤖 Compare {car.model} with AI →
        </Link>
      </div>
    </div>
  );
}
