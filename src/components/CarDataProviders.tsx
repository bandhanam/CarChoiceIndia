"use client";

import type { ReactNode } from "react";
import { CarDatasetProvider } from "@/context/CarDatasetContext";

export default function CarDataProviders({ children }: { children: ReactNode }) {
  return <CarDatasetProvider>{children}</CarDatasetProvider>;
}
