import {
  BookOpenText,
  CalendarClock,
  Flower2,
  HeartHandshake,
  Snowflake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  SITE_THEME_PRESETS,
  type SiteThemeKey,
} from "@/modules/site-theme/domain/site-theme-models";

interface ThemeScenePickerProps {
  disabled: boolean;
  manualThemeKey: SiteThemeKey | null;
  onChange: (themeKey: SiteThemeKey | null) => void;
}

const sceneIcons: Record<SiteThemeKey, LucideIcon> = {
  anniversary: Sparkles,
  bordeaux: BookOpenText,
  noel: Snowflake,
  spring: Flower2,
  valentine: HeartHandshake,
};

export function ThemeScenePicker({
  disabled,
  manualThemeKey,
  onChange,
}: ThemeScenePickerProps) {
  return (
    <fieldset className="theme-scene-picker mt-5 grid gap-3" disabled={disabled}>
      <legend className="sr-only">Chế độ không khí giao diện</legend>
      <label
        className={`theme-scene-choice theme-scene-choice--automatic ${
          manualThemeKey === null ? "is-selected" : ""
        }`}
      >
        <input
          checked={manualThemeKey === null}
          name="site-theme-mode"
          onChange={() => onChange(null)}
          type="radio"
        />
        <span aria-hidden="true" className="theme-scene-choice__preview">
          <CalendarClock size={18} />
        </span>
        <span>
          <strong>Tự động theo lịch</strong>
          <small>Không có lịch thì dùng Bordeaux Diary.</small>
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {SITE_THEME_PRESETS.map((preset) => {
          const Icon = sceneIcons[preset.key];
          const isSelected = manualThemeKey === preset.key;

          return (
            <label
              className={`theme-scene-choice ${isSelected ? "is-selected" : ""}`}
              key={preset.key}
            >
              <input
                checked={isSelected}
                name="site-theme-mode"
                onChange={() => onChange(preset.key)}
                type="radio"
              />
              <span
                aria-hidden="true"
                className="theme-scene-choice__preview"
                data-theme-preview={preset.key}
              >
                <Icon size={20} />
              </span>
              <span>
                <strong>{preset.label}</strong>
                <small>{preset.description}</small>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
