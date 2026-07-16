import { createSelectionText } from "@/lib/selection-text";
import type { PreferenceData, PreferenceSelectionState } from "@/types/preference";

export function createSelectionEmailUrl(
  data: PreferenceData,
  selection: PreferenceSelectionState,
): string {
  const subject = `Những điều ${data.site.recipientName.toLocaleLowerCase("vi-VN")} yêu`;
  const body = createSelectionText(data, selection);

  return `mailto:${encodeURI(data.site.summaryEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
