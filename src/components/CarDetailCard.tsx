"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Car } from "@/types";
import { formatPrice } from "@/lib/car-data";

interface CarDetailCardProps {
  car: Car;
  isWinner?: boolean;
  rank?: number;
  score?: number;
}

export default function CarDetailCard({
  car,
  isWinner,
  rank,
  score,
}: CarDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`car-detail-card ${isWinner ? "winner" : ""}`}
      style={{ "--card-accent": car.color } as React.CSSProperties}
    >
      {isWinner && (
        <div className="winner-badge">
          <span>🏆</span> AI Winner
        </div>
      )}
      {rank !== undefined && !isWinner && (
        <div className="rank-badge" style={{ background: car.color }}>
          #{rank}
        </div>
      )}

      <div className="card-top-row">
        <div className="card-image-col">
          <div className="card-image-wrap">
            <Image
              src={car.imageUrl}
              alt={car.name}
              width={360}
              height={200}
              className="card-hero-img"
            />
          </div>
          <div className="card-name-row">
            <div>
              <h3 className="card-title">{car.name}</h3>
              <p className="card-subtitle">
                {car.year} · {car.category}
                <Link href={`/cars/${car.id}`} className="card-detail-link">View Details →</Link>
              </p>
            </div>
            {score !== undefined && (
              <div className="card-score-inline" style={{ color: car.color }}>
                <span className="score-val">{score.toFixed(1)}</span>
                <span className="score-of">/10</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-info-col">
          <div className="card-price-row">
            <span className="card-price">{formatPrice(car.price)}</span>
            {car.variants && car.variants.length > 0 && (
              <span className="card-variant-count">{car.variants.length} variants</span>
            )}
          </div>

          <p className="card-description">{car.description}</p>

          <div className="specs-grid">
            <SpecItem label="Engine" value={car.specs.engine} />
            <SpecItem label="Power" value={`${car.specs.horsepower} HP`} />
            <SpecItem label="Torque" value={car.specs.torque} />
            <SpecItem label="Transmission" value={car.specs.transmission} />
            <SpecItem label="Drivetrain" value={car.specs.drivetrain} />
            <SpecItem
              label={car.specs.fuelType === "Electric" ? "Range" : "Mileage"}
              value={
                car.specs.fuelType === "Electric"
                  ? `${car.specs.mileage} km`
                  : `${car.specs.mileage} km/l`
              }
            />
          </div>

          <div className="card-quick-ratings">
            {[
              { label: "Perf", val: car.ratings.performance },
              { label: "Safety", val: car.ratings.safety },
              { label: "Comfort", val: car.ratings.comfort },
              { label: "Tech", val: car.ratings.technology },
              { label: "Value", val: car.ratings.valueForMoney },
            ].map((r) => (
              <div key={r.label} className="quick-rating-chip">
                <span className="qr-label">{r.label}</span>
                <span className="qr-value" style={{ color: car.color }}>{r.val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className="card-expand-btn"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Hide Details" : "Show All Features & Ratings"}
        <svg
          className={`chevron-sm ${showDetails ? "open" : ""}`}
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {showDetails && (
        <div className="card-details-expanded">
          <div className="features-section">
            <FeatureGroup title="🛡️ Safety" items={car.features.safety} color={car.color} />
            <FeatureGroup title="🪑 Comfort" items={car.features.comfort} color={car.color} />
            <FeatureGroup title="📱 Technology" items={car.features.technology} color={car.color} />
            <FeatureGroup title="✨ Exterior" items={car.features.exterior} color={car.color} />
          </div>

          <div className="ratings-bar-section">
            <h4 className="ratings-title">Detailed Ratings</h4>
            <RatingBar label="Performance" value={car.ratings.performance} color={car.color} />
            <RatingBar label="Fuel Efficiency" value={car.ratings.fuelEfficiency} color={car.color} />
            <RatingBar label="Safety" value={car.ratings.safety} color={car.color} />
            <RatingBar label="Comfort" value={car.ratings.comfort} color={car.color} />
            <RatingBar label="Technology" value={car.ratings.technology} color={car.color} />
            <RatingBar label="Value" value={car.ratings.valueForMoney} color={car.color} />
          </div>
        </div>
      )}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-item">
      <span className="spec-label">{label}</span>
      <span className="spec-value">{value}</span>
    </div>
  );
}

function FeatureGroup({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="feature-group">
      <h4 className="feature-group-title">{title}</h4>
      <div className="feature-tags">
        {items.map((item) => (
          <span
            key={item}
            className="feature-tag"
            style={{ borderColor: `${color}30` }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function RatingBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rating-bar-row">
      <span className="rating-label">{label}</span>
      <div className="rating-bar-track">
        <div
          className="rating-bar-fill"
          style={{ width: `${value * 10}%`, background: color }}
        />
      </div>
      <span className="rating-value">{value.toFixed(1)}</span>
    </div>
  );
}
