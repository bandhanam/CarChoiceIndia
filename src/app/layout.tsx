import type { Metadata, Viewport } from "next";
import "./globals.css";
import CarDataProviders from "@/components/CarDataProviders";

export const metadata: Metadata = {
  title: "Smart Compare — AI car comparison (comfortable & private)",
  description:
    "Friendly side-by-side car comparison: pick 2–5 models, run on-device AI scoring, and see a clear winner with charts. No sign-up — your shortlist stays in the browser.",
  keywords: [
    "car comparison",
    "best car 2025",
    "AI car selector",
    "car features",
    "offline AI",
    "car winner",
  ],
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <CarDataProviders>{children}</CarDataProviders>
      </body>
    </html>
  );
}
