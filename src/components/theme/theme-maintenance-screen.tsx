import {
  getSiteThemePreset,
  type SiteThemeKey,
} from "@/modules/site-theme/domain/site-theme-models";
import { DiaryBook } from "@/components/diary/diary-book";
import { DiarySurface } from "@/components/diary/diary-surface";

interface ThemeMaintenanceScreenProps {
  targetThemeKey: SiteThemeKey;
}

export function ThemeMaintenanceScreen({
  targetThemeKey,
}: ThemeMaintenanceScreenProps) {
  const preset = getSiteThemePreset(targetThemeKey);

  return (
    <DiaryBook className="theme-maintenance-screen" role="status">
      <DiarySurface className="theme-maintenance-card" kind="ledger">
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
      </DiarySurface>
    </DiaryBook>
  );
}
