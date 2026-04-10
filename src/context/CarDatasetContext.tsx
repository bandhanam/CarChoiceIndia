"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Car, BrandMeta, CarsDataset } from "@/types";
import staticDataset from "../../public/data/cars.json";
import {
  datasetFingerprint,
  isValidCarsDataset,
} from "@/lib/car-dataset-utils";
import {
  CAR_DATA_POLL_MS,
  CAR_DATA_SHOW_REFRESH_BUTTON,
} from "@/lib/car-data-refresh-config";

type RefreshState = "idle" | "checking" | "updated" | "unchanged" | "error";

interface CarDatasetContextValue {
  cars: Car[];
  brands: BrandMeta[];
  dataset: CarsDataset;
  embeddedFingerprint: string;
  refreshState: RefreshState;
  getCarById: (id: string) => Car | undefined;
  /** Re-check server for newer JSON (prices, new cars, features). */
  refreshDataset: () => Promise<void>;
  showManualRefresh: boolean;
}

const CarDatasetContext = createContext<CarDatasetContextValue | null>(null);

const embedded = staticDataset as CarsDataset;
const embeddedFp = datasetFingerprint(embedded);

function scheduleIdle(fn: () => void): () => void {
  if (typeof requestIdleCallback !== "undefined") {
    const id = requestIdleCallback(fn, { timeout: 2500 });
    return () => cancelIdleCallback(id);
  }
  const t = window.setTimeout(fn, 1800);
  return () => clearTimeout(t);
}

export function CarDatasetProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<CarsDataset>(embedded);
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");
  const cancelled = useRef(false);
  /** Tracks last applied version|lastUpdated so we detect updates after the first load. */
  const lastAppliedFp = useRef(embeddedFp);
  const checkingRef = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    if (!cancelled.current) setRefreshState("checking");
    try {
      const metaRes = await fetch("/api/car-data/meta", { cache: "no-store" });
      if (!metaRes.ok) throw new Error("meta");
      const meta: { lastUpdated?: string; version?: string } =
        await metaRes.json();
      const remoteFp = `${meta.version ?? ""}|${meta.lastUpdated ?? ""}`;
      if (!remoteFp || remoteFp === "|") {
        if (!cancelled.current) setRefreshState("unchanged");
        return;
      }
      if (remoteFp === lastAppliedFp.current) {
        if (!cancelled.current) setRefreshState("unchanged");
        return;
      }
      const fullRes = await fetch("/api/car-data", { cache: "no-store" });
      if (!fullRes.ok) throw new Error("full");
      const next: unknown = await fullRes.json();
      if (!isValidCarsDataset(next)) throw new Error("invalid");
      if (!cancelled.current) {
        lastAppliedFp.current = datasetFingerprint(next);
        setDataset(next);
        setRefreshState("updated");
      }
    } catch {
      if (!cancelled.current) setRefreshState("error");
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const refreshDataset = useCallback(async () => {
    await checkForUpdate();
  }, [checkForUpdate]);

  useEffect(() => {
    cancelled.current = false;
    const cancelIdle = scheduleIdle(() => {
      void checkForUpdate();
    });
    return () => {
      cancelled.current = true;
      cancelIdle();
    };
  }, [checkForUpdate]);

  useEffect(() => {
    if (CAR_DATA_POLL_MS <= 0) return;
    const id = window.setInterval(() => {
      void checkForUpdate();
    }, CAR_DATA_POLL_MS);
    return () => clearInterval(id);
  }, [checkForUpdate]);

  useEffect(() => {
    let t: number | undefined;
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      if (t) clearTimeout(t);
      t = window.setTimeout(() => {
        void checkForUpdate();
      }, 1500);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (t) clearTimeout(t);
    };
  }, [checkForUpdate]);

  const getCarById = useCallback(
    (id: string) => dataset.cars.find((c) => c.id === id),
    [dataset.cars]
  );

  const value = useMemo<CarDatasetContextValue>(
    () => ({
      cars: dataset.cars,
      brands: dataset.brands,
      dataset,
      embeddedFingerprint: embeddedFp,
      refreshState,
      getCarById,
      refreshDataset,
      showManualRefresh: CAR_DATA_SHOW_REFRESH_BUTTON,
    }),
    [dataset, refreshState, getCarById, refreshDataset]
  );

  return (
    <CarDatasetContext.Provider value={value}>
      {children}
    </CarDatasetContext.Provider>
  );
}

export function useCarDataset(): CarDatasetContextValue {
  const ctx = useContext(CarDatasetContext);
  if (!ctx) {
    throw new Error("useCarDataset must be used within CarDatasetProvider");
  }
  return ctx;
}
