import {
  getSiteThemePreset,
  type SiteThemeKey,
} from "@/modules/site-theme/domain/site-theme-models";

interface ThemeMaintenanceScreenProps {
  targetThemeKey: SiteThemeKey;
}

export function ThemeMaintenanceScreen({
  targetThemeKey,
}: ThemeMaintenanceScreenProps) {
  const preset = getSiteThemePreset(targetThemeKey);

  return (
    <main className="theme-maintenance-screen diary-shell" role="status">
      <section className="theme-maintenance-card">
        <p className="diary-kicker">{preset.label}</p>
        <h1 className="font-display">Không gian đang thay áo mới</h1>
        <p>
          Chúng mình đang hoàn thiện một chương mới. Trang sẽ trở lại trong giây
          lát.
        </p>
        <span aria-hidden="true" className="theme-maintenance-meter">
          <i />
          <i />
          <i />
        </span>
      </section>
    </main>
  );
}
