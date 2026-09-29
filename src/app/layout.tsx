import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import { ThemeAtmosphere } from "@/components/theme/theme-atmosphere";
import { ThemeMaintenanceScreen } from "@/components/theme/theme-maintenance-screen";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import "./globals.css";

/* Two families. Newsreader (with optical sizes) sets headings and every word
 * written by members; Be Vietnam Pro, drawn for Vietnamese, sets the
 * interface. Both carry full Vietnamese diacritics. */
const serifFont = Newsreader({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
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
  themeColor: "#F5F1EA",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const backend = await createServerBackend();
  const theme = await backend.resolveSiteTheme.execute();
  const activeThemeKey = theme.transition?.targetThemeKey ?? theme.key;

  return (
    <html lang="vi">
      <body
        className={`${serifFont.variable} ${bodyFont.variable}`}
        data-theme={activeThemeKey}
      >
        <ThemeAtmosphere theme={activeThemeKey} />
        {theme.transition ? (
          <ThemeMaintenanceScreen targetThemeKey={activeThemeKey} />
        ) : (
          children
        )}
      </body>
    </html>
  );
}
