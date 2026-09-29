import type { SiteThemeKey } from "@/modules/site-theme/domain/site-theme-models";

interface ThemeAtmosphereProps {
  theme: SiteThemeKey;
}

/* Static light and paper grain. Nothing animates, so there is nothing to pause
 * when the tab is hidden and nothing to disable for reduced motion. */
export function ThemeAtmosphere({ theme }: ThemeAtmosphereProps) {
  return (
    <div aria-hidden="true" className="theme-atmosphere" data-scene={theme}>
      <span className="theme-atmosphere__light" />
      <span className="theme-atmosphere__grain" />
    </div>
  );
}
