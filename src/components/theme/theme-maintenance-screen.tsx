import {
  getSiteThemePreset,
  type SiteThemeKey,
} from "@/modules/site-theme/domain/site-theme-models";
import { ReloadButton } from "@/components/theme/reload-button";

interface ThemeMaintenanceScreenProps {
  targetThemeKey: SiteThemeKey;
}

export function ThemeMaintenanceScreen({ targetThemeKey }: ThemeMaintenanceScreenProps) {
  const preset = getSiteThemePreset(targetThemeKey);

  return (
    <main className="theme-maintenance-screen" role="status">
      <section className="theme-maintenance-card">
        <h1 className="font-display display-md text-brand-strong">
          Không gian đang được thay áo mới
        </h1>
        <p className="mt-4 text-ink">
          Đang chuyển sang không khí “{preset.label}”. Trang sẽ quay lại sau khoảng 1–2 phút.
        </p>
        <div className="mt-7">
          <ReloadButton />
        </div>
      </section>
    </main>
  );
}
