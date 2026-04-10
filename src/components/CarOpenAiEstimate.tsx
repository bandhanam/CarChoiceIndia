"use client";

import { useState } from "react";
import type { Car } from "@/types";
import type { CarMarketEstimate } from "@/types/openai-car-estimate";
import { formatPrice } from "@/lib/car-data";

interface Props {
  car: Car;
  activeVariantName: string | null;
  displayPrice: number;
}

export default function CarOpenAiEstimate({
  car,
  activeVariantName,
  displayPrice,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<CarMarketEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setEstimate(null);
    setUsedModel(null);
    try {
      const res = await fetch("/api/openai/car-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: car.brand,
          model: car.model,
          year: car.year,
          category: car.category,
          variantName: activeVariantName || undefined,
          referencePriceInr: displayPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      if (data.estimate) {
        setEstimate(data.estimate as CarMarketEstimate);
        setUsedModel(typeof data.model === "string" ? data.model : null);
      } else {
        setError("Unexpected response");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cdp-section cdp-openai-section">
      <h2 className="cdp-section-title">
        <span>✨</span> OpenAI market check <span className="cdp-openai-badge">Try it</span>
      </h2>
      <p className="cdp-openai-intro">
        Experimental: asks OpenAI for an <strong>indicative</strong> India ex-showroom band and
        short notes. Not official pricing — always confirm with a dealer.
      </p>
      <button
        type="button"
        className="cdp-openai-btn"
        onClick={() => void run()}
        disabled={loading}
      >
        {loading ? "Calling OpenAI…" : "Get AI price & feature hints"}
      </button>
      {error && (
        <p className="cdp-openai-error" role="alert">
          {error}
        </p>
      )}
      {estimate && (
        <div className="cdp-openai-result">
          <p className="cdp-openai-disclaimer">{estimate.disclaimer}</p>
          <p className="cdp-openai-range">
            Indicative band:{" "}
            <strong>{formatPrice(estimate.estimatedExShowroomMinInr)}</strong>
            {" — "}
            <strong>{formatPrice(estimate.estimatedExShowroomMaxInr)}</strong>
          </p>
          <p className="cdp-openai-meta">
            {estimate.asOfHint} · {estimate.confidenceNote}
            {usedModel ? ` · Model: ${usedModel}` : ""}
          </p>
          {estimate.highlights.length > 0 && (
            <>
              <h3 className="cdp-openai-sub">Highlights</h3>
              <ul className="cdp-openai-list">
                {estimate.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </>
          )}
          {estimate.featureNotes.length > 0 && (
            <>
              <h3 className="cdp-openai-sub">Feature / change notes</h3>
              <ul className="cdp-openai-list">
                {estimate.featureNotes.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}
