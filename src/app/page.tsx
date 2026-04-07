"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CARS } from "@/lib/car-data";
import { runAIComparison } from "@/lib/ai-engine";
import { Car, ComparisonResult } from "@/types";
import Sidebar from "@/components/Sidebar";
import CarDetailCard from "@/components/CarDetailCard";
import Fireworks from "@/components/Fireworks";
import MobileBottomNav, { MobileTab } from "@/components/MobileBottomNav";
import MobileBrowse from "@/components/MobileBrowse";

const AIWinnerPanel = dynamic(() => import("@/components/AIWinnerPanel"), {
  ssr: false,
});
const ComparisonCharts = dynamic(
  () => import("@/components/ComparisonCharts"),
  { ssr: false }
);

interface SelectedItem {
  carId: string;
  variantName?: string;
}

function buildComparisonCar(item: SelectedItem): Car | null {
  const baseCar = CARS.find((c) => c.id === item.carId);
  if (!baseCar) return null;

  if (!item.variantName) return baseCar;

  const variant = baseCar.variants?.find((v) => v.name === item.variantName);
  if (!variant) return baseCar;

  return {
    ...baseCar,
    id: `${baseCar.id}__${item.variantName}`,
    name: `${baseCar.brand} ${baseCar.model} ${item.variantName}`,
    price: variant.price,
  };
}

const maxPriceLakh = Math.ceil(
  Math.max(...CARS.map((c) => c.price / 100000))
);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("browse");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceLakh]);

  const isPriceFiltered = priceRange[0] > 0 || priceRange[1] < maxPriceLakh;

  const filteredByPrice = useMemo(() => {
    if (!isPriceFiltered) return [];
    const minP = priceRange[0] * 100000;
    const maxP = priceRange[1] * 100000;
    return CARS.filter((c) => c.price >= minP && c.price <= maxP);
  }, [priceRange, isPriceFiltered]);

  const priceRankedResult = useMemo(() => {
    if (!isPriceFiltered || selectedItems.length > 0 || filteredByPrice.length < 2) return null;
    return runAIComparison(filteredByPrice);
  }, [filteredByPrice, isPriceFiltered, selectedItems.length]);

  const priceRankedCars = useMemo(() => {
    if (!priceRankedResult) return [];
    return priceRankedResult.scores
      .map((s) => filteredByPrice.find((c) => c.id === s.carId))
      .filter((c): c is Car => c !== null);
  }, [priceRankedResult, filteredByPrice]);

  const handleToggle = useCallback(
    (carId: string, variantName?: string) => {
      setSelectedItems((prev) => {
        const idx = prev.findIndex(
          (item) => item.carId === carId && item.variantName === variantName
        );
        if (idx >= 0) {
          return prev.filter((_, i) => i !== idx);
        }
        if (prev.length >= 5) return prev;
        return [...prev, { carId, variantName }];
      });
      setResult(null);
    },
    []
  );

  const comparisonCars = useMemo(() => {
    return selectedItems
      .map(buildComparisonCar)
      .filter((c): c is Car => c !== null);
  }, [selectedItems]);

  const handleRunAI = useCallback(async () => {
    if (comparisonCars.length < 2) return;

    if (isMobile) setMobileTab("compare");

    setIsAnalyzing(true);
    setResult(null);
    setShowFireworks(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const comparison = runAIComparison(comparisonCars);
    setResult(comparison);
    setIsAnalyzing(false);
    setShowFireworks(true);
  }, [comparisonCars, isMobile]);

  useEffect(() => {
    if (showFireworks) {
      const timer = setTimeout(() => setShowFireworks(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showFireworks]);

  const showPriceRanking = isPriceFiltered && selectedItems.length === 0 && priceRankedResult && priceRankedCars.length > 0;

  const handleMobileTabChange = (tab: MobileTab) => {
    if (tab === "allcars") {
      router.push("/cars");
      return;
    }
    setMobileTab(tab);
  };

  // ==================== MOBILE LAYOUT ====================
  if (isMobile) {
    return (
      <div className="mob-app">
        {showFireworks && <Fireworks duration={3800} />}

        {/* Top bar */}
        <header className="mob-topbar">
          <h1 className="mob-topbar-title">Car Selector AI</h1>
          <div className="mob-topbar-badge">
            <span className="mob-dot" />
            AI
          </div>
        </header>

        {/* Tab content */}
        <div className="mob-content">
          {mobileTab === "browse" && (
            <MobileBrowse
              selectedItems={selectedItems}
              onToggle={handleToggle}
              onSwitchToCompare={() => setMobileTab("compare")}
            />
          )}

          {mobileTab === "compare" && (
            <div className="mob-compare-view">
              {isAnalyzing && (
                <div className="mob-analyzing">
                  <div className="mob-analyzing-spinner" />
                  <p>AI is analyzing your cars...</p>
                </div>
              )}

              {result && (
                <div className={`winner-reveal ${showFireworks ? "animating" : ""}`}>
                  <AIWinnerPanel result={result} cars={comparisonCars} />
                </div>
              )}

              {result && (
                <div className="fade-in" style={{ marginTop: 16 }}>
                  <ComparisonCharts result={result} cars={comparisonCars} />
                </div>
              )}

              {comparisonCars.length > 0 ? (
                <div className="mob-compare-cards">
                  {comparisonCars.map((car) => {
                    const score = result?.scores.find((s) => s.carId === car.id);
                    const rank = result
                      ? result.scores.findIndex((s) => s.carId === car.id) + 1
                      : undefined;
                    return (
                      <CarDetailCard
                        key={car.id}
                        car={car}
                        isWinner={result?.winnerId === car.id}
                        rank={rank}
                        score={score?.overallScore}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mob-compare-empty">
                  <div className="mob-compare-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bfc3d0" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3>No cars to compare</h3>
                  <p>Go to Browse and tap on cars to select them (2-5 cars)</p>
                  <button
                    className="mob-goto-browse"
                    onClick={() => setMobileTab("browse")}
                  >
                    Browse Cars
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAB - Find Winner */}
        {selectedItems.length >= 2 && !isAnalyzing && mobileTab === "browse" && (
          <button className="mob-fab" onClick={handleRunAI}>
            <span className="mob-fab-icon">🏆</span>
            <span className="mob-fab-text">Find Winner</span>
          </button>
        )}

        {/* Bottom nav */}
        <MobileBottomNav
          activeTab={mobileTab}
          onTabChange={handleMobileTabChange}
          selectedCount={selectedItems.length}
        />
      </div>
    );
  }

  // ==================== DESKTOP LAYOUT ====================
  return (
    <div className="app-layout">
      <button
        className={`mobile-menu-toggle ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <div className="mobile-menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {mobileMenuOpen && (
        <div
          className="mobile-overlay visible"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        cars={CARS}
        selectedItems={selectedItems}
        onToggle={handleToggle}
        onRunAI={handleRunAI}
        isAnalyzing={isAnalyzing}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        maxPriceLakh={maxPriceLakh}
      />

      <main className="main-content">
        {showFireworks && <Fireworks duration={3800} />}

        <header className="app-header">
          <div>
            <h1 className="header-title">Car Selector AI</h1>
            <p className="header-subtitle">
              Confused which car to buy? Pick your top choices and let AI end the debate.
            </p>
          </div>
          <div className="header-badge">
            <span className="live-dot" />
            AI Ready
          </div>
        </header>

        {result && (
          <div className={`winner-reveal ${showFireworks ? "animating" : ""}`}>
            <AIWinnerPanel result={result} cars={comparisonCars} />
          </div>
        )}

        {result && (
          <div className="fade-in">
            <h2 className="section-title">
              <span>📊</span> Comparison Charts
            </h2>
            <ComparisonCharts result={result} cars={comparisonCars} />
          </div>
        )}

        {comparisonCars.length > 0 ? (
          <>
            <h2 className="section-title">
              <span>🚗</span> Selected Cars ({comparisonCars.length})
            </h2>
            <div className="cars-grid">
              {comparisonCars.map((car) => {
                const score = result?.scores.find((s) => s.carId === car.id);
                const rank = result
                  ? result.scores.findIndex((s) => s.carId === car.id) + 1
                  : undefined;
                return (
                  <CarDetailCard
                    key={car.id}
                    car={car}
                    isWinner={result?.winnerId === car.id}
                    rank={rank}
                    score={score?.overallScore}
                  />
                );
              })}
            </div>
          </>
        ) : showPriceRanking ? (
          <>
            <div className="price-ranking-header fade-in">
              <h2 className="section-title">
                <span>🏅</span> Top Cars in ₹{priceRange[0]}L – ₹{priceRange[1]}L ({priceRankedCars.length} cars ranked)
              </h2>
              <p className="price-ranking-hint">
                AI-ranked by performance, safety, comfort, technology & value. Select specific cars to compare head-to-head.
              </p>
            </div>
            <div className="cars-grid">
              {priceRankedCars.map((car, idx) => {
                const score = priceRankedResult!.scores.find((s) => s.carId === car.id);
                return (
                  <CarDetailCard
                    key={car.id}
                    car={car}
                    isWinner={idx === 0}
                    rank={idx + 1}
                    score={score?.overallScore}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-emoji">👈</div>
            <h3>Select cars from the sidebar</h3>
            <p>Pick 2 to 5 cars or variants, then let AI find the best one for you.<br />Or use the price filter to see all cars ranked in a budget.</p>
          </div>
        )}
      </main>
    </div>
  );
}
