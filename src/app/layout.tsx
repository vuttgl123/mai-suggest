import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import "./globals.css";

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Điều Em Yêu",
  description: "Một không gian nhỏ để lưu lại những điều em yêu thích.",
  openGraph: {
    title: "Điều Em Yêu",
    description: "Một không gian nhỏ để lưu lại những điều em yêu thích.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5A0D18",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const backend = await createServerBackend();
  const theme = await backend.resolveSiteTheme.execute();

  return (
    <html lang="vi">
      <body
        className={`${displayFont.variable} ${bodyFont.variable}`}
        data-theme={theme.key}
      >
        {children}
      </body>
    </html>
  );
}
