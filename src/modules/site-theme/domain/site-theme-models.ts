export const SITE_THEME_KEYS = [
  "bordeaux",
  "valentine",
  "spring",
  "noel",
  "anniversary",
] as const;

export type SiteThemeKey = (typeof SITE_THEME_KEYS)[number];

export const DEFAULT_SITE_THEME_KEY: SiteThemeKey = "bordeaux";

export interface SiteThemePreset {
  key: SiteThemeKey;
  label: string;
  description: string;
}

export const SITE_THEME_PRESETS: readonly SiteThemePreset[] = [
  {
    key: "bordeaux",
    label: "Bordeaux Diary",
    description: "Đỏ Bordeaux, giấy ngà và đồng tiết chế.",
  },
  {
    key: "valentine",
    label: "Lời hẹn tháng Hai",
    description: "Ruby sâu và ánh đồng ấm.",
  },
  {
    key: "spring",
    label: "Mùa xuân dịu dàng",
    description: "Berry trầm và sage kín đáo.",
  },
  {
    key: "noel",
    label: "Đêm cuối năm",
    description: "Bordeaux, evergreen và champagne.",
  },
  {
    key: "anniversary",
    label: "Chương kỷ niệm",
    description: "Wine đậm và ánh vàng cổ.",
  },
];

export function getSiteThemePreset(key: SiteThemeKey): SiteThemePreset {
  return (
    SITE_THEME_PRESETS.find((preset) => preset.key === key) ??
    SITE_THEME_PRESETS[0]
  );
}

export interface SiteThemeSettings {
  manualThemeKey: SiteThemeKey | null;
  updatedAt: string;
}

export interface SiteThemeSchedule {
  id: string;
  themeKey: SiteThemeKey;
  startsAt: string;
  endsAt: string;
  priority: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteThemeScheduleInput {
  themeKey: SiteThemeKey;
  startsAt: string;
  endsAt: string;
  priority: number;
  isEnabled: boolean;
}

export interface ResolvedSiteTheme {
  key: SiteThemeKey;
  source: "manual" | "schedule" | "default" | "fallback";
  scheduleId: string | null;
}

export interface SiteThemeManagement {
  settings: SiteThemeSettings;
  schedules: SiteThemeSchedule[];
  resolved: ResolvedSiteTheme;
}
