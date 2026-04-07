"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ComparisonResult, Car } from "@/types";

interface ComparisonChartsProps {
  result: ComparisonResult;
  cars: Car[];
}

export default function ComparisonCharts({
  result,
  cars,
}: ComparisonChartsProps) {
  const categories = [
    { key: "performance", label: "Performance" },
    { key: "efficiency", label: "Efficiency" },
    { key: "safety", label: "Safety" },
    { key: "comfort", label: "Comfort" },
    { key: "technology", label: "Technology" },
    { key: "value", label: "Value" },
  ];

  const radarData = categories.map((cat) => {
    const point: Record<string, string | number> = { category: cat.label };
    result.scores.forEach((score) => {
      const car = cars.find((c) => c.id === score.carId)!;
      point[car.name] =
        score.categoryScores[cat.key as keyof typeof score.categoryScores];
    });
    return point;
  });

  const barData = result.scores.map((score) => {
    const car = cars.find((c) => c.id === score.carId)!;
    return {
      name: car.name,
      score: score.overallScore,
      fill: car.color,
    };
  });

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3 className="chart-title">
          <span>📊</span> Category Comparison
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#dde1ea" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#555770", fontSize: 12 }}
            />
            <PolarRadiusAxis
              domain={[0, 10]}
              tick={{ fill: "#8b8da3", fontSize: 10 }}
            />
            {result.scores.map((score) => {
              const car = cars.find((c) => c.id === score.carId)!;
              return (
                <Radar
                  key={car.id}
                  name={car.name}
                  dataKey={car.name}
                  stroke={car.color}
                  fill={car.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              );
            })}
            <Legend
              wrapperStyle={{ color: "#1a1a2e", fontSize: 12, paddingTop: 16 }}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e0e4ed",
                borderRadius: 8,
                color: "#1a1a2e",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">
          <span>🏅</span> Overall AI Scores
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fill: "#8b8da3", fontSize: 12 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={130}
              tick={{ fill: "#1a1a2e", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e0e4ed",
                borderRadius: 8,
                color: "#1a1a2e",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [Number(value).toFixed(2), "Score"]}
            />
            <Bar
              dataKey="score"
              radius={[0, 8, 8, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
