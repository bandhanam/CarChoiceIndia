"use client";

export type MobileTab = "browse" | "compare" | "allcars";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  selectedCount: number;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  selectedCount,
}: MobileBottomNavProps) {
  return (
    <nav className="mob-bottom-nav">
      <button
        className={`mob-nav-tab ${activeTab === "browse" ? "active" : ""}`}
        onClick={() => onTabChange("browse")}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Browse</span>
      </button>

      <button
        className={`mob-nav-tab ${activeTab === "compare" ? "active" : ""}`}
        onClick={() => onTabChange("compare")}
      >
        <div className="mob-nav-tab-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          {selectedCount > 0 && (
            <span className="mob-nav-badge">{selectedCount}</span>
          )}
        </div>
        <span>Compare</span>
      </button>

      <button
        className={`mob-nav-tab ${activeTab === "allcars" ? "active" : ""}`}
        onClick={() => onTabChange("allcars")}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span>All Cars</span>
      </button>
    </nav>
  );
}
