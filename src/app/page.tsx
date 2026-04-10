"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useCarDataset } from "@/context/CarDatasetContext";
import { runAIComparison } from "@/lib/ai-engine";
import { Car, ComparisonResult } from "@/types";
import Sidebar from "@/components/Sidebar";
import CarDetailCard from "@/components/CarDetailCard";
import Fireworks from "@/components/Fireworks";
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
  const {
    cars,
    brands,
    refreshState,
    refreshDataset,
    showManualRefresh,
  } = useCarDataset();
  const maxPriceLakh = useMemo(
    () => Math.ceil(Math.max(...cars.map((c) => c.price / 100000), 1)),
    [cars]
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  useLayoutEffect(() => {
    setPriceRange(([lo]) => [lo, maxPriceLakh]);
  }, [maxPriceLakh]);

  const isMobile = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const buildComparisonCar = useCallback(
    (item: SelectedItem): Car | null => {
      const baseCar = cars.find((c) => c.id === item.carId);
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
    },
    [cars]
  );

  const isPriceFiltered = priceRange[0] > 0 || priceRange[1] < maxPriceLakh;

  const filteredByPrice = useMemo(() => {
    if (!isPriceFiltered) return [];
    const minP = priceRange[0] * 100000;
    const maxP = priceRange[1] * 100000;
    return cars.filter((c) => c.price >= minP && c.price <= maxP);
  }, [priceRange, isPriceFiltered, cars]);

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
  }, [selectedItems, buildComparisonCar]);

  const handleRunAI = useCallback(async () => {
    if (comparisonCars.length < 2) return;

    setIsAnalyzing(true);
    setResult(null);
    setShowFireworks(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const comparison = runAIComparison(comparisonCars);
    setResult(comparison);
    setIsAnalyzing(false);
    setShowFireworks(true);

    if (isMobile) {
      setTimeout(() => {
        document.getElementById("mob-compare-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [comparisonCars, isMobile]);

  useEffect(() => {
    if (showFireworks) {
      const timer = setTimeout(() => setShowFireworks(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showFireworks]);

  const showPriceRanking = isPriceFiltered && selectedItems.length === 0 && priceRankedResult && priceRankedCars.length > 0;

  const selectedCars = useMemo(() => {
    return selectedItems
      .map((item) => cars.find((c) => c.id === item.carId))
      .filter((c): c is Car => c !== null && c !== undefined);
  }, [selectedItems, cars]);

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ==================== MOBILE LAYOUT ====================
  if (isMobile) {
    return (
      <div className="mob-app">
        {showFireworks && <Fireworks duration={3800} />}

        {/* Top bar */}
        <header className="mob-topbar">
          <div>
            <h1 className="mob-topbar-title">Car Selector AI</h1>
            <p className="mob-topbar-desc">Select the variant of car and hit Find Winner</p>
          </div>
          <div className="mob-topbar-badge">
            <span className="mob-dot" />
            AI
          </div>
        </header>

        {/* Sticky section tabs */}
        <nav className="mob-section-tabs">
          <button className="mob-section-tab" onClick={() => scrollToSection("mob-browse-section")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Browse
          </button>
          <button
            className={`mob-section-tab ${selectedItems.length > 0 ? "has-count" : ""}`}
            onClick={() => scrollToSection("mob-compare-section")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Compare
            {selectedItems.length > 0 && (
              <span className="mob-tab-count">{selectedItems.length}</span>
            )}
          </button>
          <button className="mob-section-tab" onClick={() => scrollToSection("mob-allcars-section")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            All Cars
          </button>
        </nav>

        {/* Top Find Winner button */}
        {selectedItems.length >= 2 && (
          <button
            className="mob-top-find-winner"
            onClick={handleRunAI}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <><span className="mob-top-spinner" /> Analyzing...</>
            ) : (
              <><span>🏆</span> Find Winner ({selectedItems.length} cars selected)</>
            )}
          </button>
        )}

        {/* Scrollable content — all sections visible */}
        <div className="mob-content">

          {/* ===== SECTION: BROWSE ===== */}
          <div className="mob-section" id="mob-browse-section">
            <MobileBrowse
              cars={cars}
              brands={brands}
              selectedItems={selectedItems}
              onToggle={handleToggle}
            />
          </div>

          {/* ===== SECTION: SELECTED / COMPARE ===== */}
          <div className="mob-section" id="mob-compare-section">

            {/* Selected cars strip */}
            {selectedItems.length > 0 && (
              <div className="mob-selected-strip">
                <div className="mob-selected-scroll">
                  {selectedCars.map((car) => {
                    const itemsForCar = selectedItems.filter((i) => i.carId === car.id);
                    return itemsForCar.map((item) => (
                      <div key={`${item.carId}-${item.variantName || "base"}`} className="mob-selected-thumb">
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
                          onClick={() => handleToggle(item.carId, item.variantName)}
                          aria-label={`Remove ${car.name}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                        {item.variantName && (
                          <span className="mob-selected-variant-label">{item.variantName.slice(0, 6)}</span>
                        )}
                      </div>
                    ));
                  })}
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="mob-analyzing">
                <div className="mob-analyzing-spinner" />
                <p>AI is analyzing your cars...</p>
              </div>
            )}

            {result && (
              <div className={`winner-reveal ${showFireworks ? "animating" : ""}`} style={{ margin: "0 14px" }}>
                <AIWinnerPanel result={result} cars={comparisonCars} />
              </div>
            )}

            {result && (
              <div className="fade-in" style={{ margin: "16px 14px 0" }}>
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
              <div className="mob-compare-empty-inline">
                <p>Tap on cars above to select 2-5 for comparison</p>
              </div>
            )}
          </div>

          {/* ===== SECTION: ALL CARS ===== */}
          <div className="mob-section" id="mob-allcars-section">
            <div className="mob-allcars-link-wrap">
              <Link href="/cars" className="mob-allcars-link">
                View Complete Car Collection with Full Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* FAB - Find Winner */}
        {selectedItems.length >= 2 && !isAnalyzing && (
          <button className="mob-fab" onClick={handleRunAI}>
            <span className="mob-fab-icon">🏆</span>
            <span className="mob-fab-text">Find Winner</span>
          </button>
        )}
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
        cars={cars}
        brands={brands}
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
            {refreshState === "updated" && (
              <p className="header-data-hint" role="status" aria-live="polite">
                Car list updated to latest dataset.
              </p>
            )}
          </div>
          <div className="header-actions">
            {showManualRefresh && (
              <button
                type="button"
                className="header-refresh-btn"
                onClick={() => void refreshDataset()}
                disabled={refreshState === "checking"}
                title="Fetch latest prices & cars from server"
              >
                {refreshState === "checking" ? "Updating…" : "Refresh prices"}
              </button>
            )}
            <div
              className="header-badge"
              title={
                refreshState === "checking"
                  ? "Checking for newer prices…"
                  : undefined
              }
            >
              <span
                className={`live-dot ${refreshState === "checking" ? "pulse" : ""}`}
              />
              {refreshState === "checking" ? "Syncing…" : "AI Ready"}
            </div>
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
