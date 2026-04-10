import type { Metadata, Viewport } from "next";
import "./globals.css";
import CarDataProviders from "@/components/CarDataProviders";

export const metadata: Metadata = {
  title: "Car Selector - AI-Powered Car Comparison & Winner",
  description:
    "Compare latest 2025 cars with AI-powered analysis. Select 2-5 cars and let offline AI pick the best one based on performance, safety, comfort, technology and value.",
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
  themeColor: "#3366ff",
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
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <CarDataProviders>{children}</CarDataProviders>
      </body>
    </html>
  );
}
