import type { SiteThemeKey } from "@/modules/site-theme/domain/site-theme-models";

interface ThemeAtmosphereProps {
  theme: SiteThemeKey;
}

export function ThemeAtmosphere({ theme }: ThemeAtmosphereProps) {
  return (
    <div aria-hidden="true" className="theme-atmosphere" data-scene={theme}>
      <span className="theme-atmosphere__wash" />
      <span className="theme-atmosphere__glow theme-atmosphere__glow--one" />
      <span className="theme-atmosphere__glow theme-atmosphere__glow--two" />
      <span className="theme-atmosphere__ornament theme-atmosphere__ornament--one" />
      <span className="theme-atmosphere__ornament theme-atmosphere__ornament--two" />
      <span className="theme-atmosphere__specks" />
    </div>
  );
}
