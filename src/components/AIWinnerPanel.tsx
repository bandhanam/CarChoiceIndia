"use client";

import Image from "next/image";
import { ComparisonResult, Car } from "@/types";
import { formatPrice } from "@/lib/car-data";

interface AIWinnerPanelProps {
  result: ComparisonResult;
  cars: Car[];
}

export default function AIWinnerPanel({ result, cars }: AIWinnerPanelProps) {
  const winnerCar = cars.find((c) => c.id === result.winnerId)!;
  const winnerScore = result.scores.find((s) => s.carId === result.winnerId)!;

  return (
    <div className="winner-panel">
      <div className="winner-panel-header">
        <div className="winner-trophy">🏆</div>
        <div>
          <h2 className="winner-panel-title">AI Recommends</h2>
          <p className="winner-panel-subtitle">{result.modelVersion}</p>
        </div>
      </div>

      <div className="winner-hero" style={{ "--winner-color": winnerCar.color } as React.CSSProperties}>
        <div className="winner-hero-image-wrap">
          <Image
            src={winnerCar.imageUrl}
            alt={winnerCar.name}
            width={500}
            height={281}
            className="winner-hero-image"
          />
        </div>
        <h3 className="winner-hero-name">{winnerCar.name}</h3>
        <p className="winner-hero-category">{winnerCar.category} · {winnerCar.year}</p>
        <p className="winner-hero-price">{formatPrice(winnerCar.price)}</p>

        <div className="winner-score-circle">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e8ecf4"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={winnerCar.color}
              strokeWidth="8"
              strokeDasharray={`${(winnerScore.overallScore / 10) * 326.7} 326.7`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="score-center">
            <span className="score-number">{winnerScore.overallScore.toFixed(1)}</span>
            <span className="score-out-of">/10</span>
          </div>
        </div>

        <div className="confidence-bar">
          <span className="confidence-label">
            Confidence: {(winnerScore.confidence * 100).toFixed(0)}%
          </span>
          <div className="confidence-track">
            <div
              className="confidence-fill"
              style={{
                width: `${winnerScore.confidence * 100}%`,
                background: winnerCar.color,
              }}
            />
          </div>
        </div>
      </div>

      <div className="winner-reasons">
        <h4 className="reasons-title">Why this car wins</h4>
        <ul className="reasons-list">
          {winnerScore.reasoning.map((reason, i) => (
            <li key={i} className="reason-item">
              <span className="reason-bullet" style={{ background: winnerCar.color }} />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="rankings-section">
        <h4 className="rankings-title">Full Rankings</h4>
        {result.scores.map((score, idx) => {
          const car = cars.find((c) => c.id === score.carId)!;
          const isWinner = idx === 0;
          return (
            <div
              key={score.carId}
              className={`ranking-row ${isWinner ? "ranking-winner" : ""}`}
            >
              <span className="ranking-position">#{idx + 1}</span>
              <div className="ranking-info">
                <span className="ranking-name">{car.name}</span>
                <div className="ranking-bar-track">
                  <div
                    className="ranking-bar-fill"
                    style={{
                      width: `${(score.overallScore / 10) * 100}%`,
                      background: car.color,
                    }}
                  />
                </div>
              </div>
              <span className="ranking-score" style={{ color: car.color }}>
                {score.overallScore.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="analysis-meta">
        <span>Analyzed: {new Date(result.analysisTimestamp).toLocaleString()}</span>
        <span className="offline-badge">🟢 AI Analysis</span>
      </div>
    </div>
  );
}
