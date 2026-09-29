export const SITE_THEME_KEYS = [
  "bordeaux",
  "valentine",
  "spring",
  "noel",
  "anniversary",
] as const;

export type SiteThemeKey = (typeof SITE_THEME_KEYS)[number];

export const DEFAULT_SITE_THEME_KEY: SiteThemeKey = "bordeaux";

export type ThemeTransitionState = "idle" | "transitioning";

export const THEME_SCENE_TRANSITION_DURATION_MS = 90_000;

export interface ThemeSceneTransition {
  targetThemeKey: SiteThemeKey;
  startedAt: string;
  expiresAt: string;
}

export interface SiteThemePreset {
  key: SiteThemeKey;
  label: string;
  description: string;
}

export const SITE_THEME_PRESETS: readonly SiteThemePreset[] = [
  {
    key: "bordeaux",
    label: "Bordeaux Diary",
    description: "Giấy ngà và Bordeaux, không khí mặc định.",
  },
  {
    key: "valentine",
    label: "Lời hẹn tháng Hai",
    description: "Giấy ấm hơn, sắc ruby cho tháng Hai.",
  },
  {
    key: "spring",
    label: "Mùa xuân dịu dàng",
    description: "Giấy ngà với ánh sage nhẹ.",
  },
  {
    key: "noel",
    label: "Đêm cuối năm",
    description: "Nền xanh đêm, ánh vàng ấm. Chủ đề tối.",
  },
  {
    key: "anniversary",
    label: "Chương kỷ niệm",
    description: "Giấy sâu màu, rượu vang và vàng cổ.",
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
  transitionState: ThemeTransitionState;
  transitionTargetThemeKey: SiteThemeKey | null;
  transitionStartedAt: string | null;
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
  transition: ThemeSceneTransition | null;
}

export interface SiteThemeManagement {
  settings: SiteThemeSettings;
  schedules: SiteThemeSchedule[];
  resolved: ResolvedSiteTheme;
}
