import type {
  PreferenceData,
  PreferenceSelectionState,
} from "@/types/preference";
import { selectValidSelection } from "@/features/selection/lib/selection-selectors";

function formatUpdatedAt(updatedAt: string | null): string {
  if (!updatedAt) return "Chưa ghi nhận";

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Chưa ghi nhận";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function createSelectionText(
  data: PreferenceData,
  selection: PreferenceSelectionState,
): string {
  const sections = selectValidSelection(data, selection).map(
    ({ category, items, favoriteItemId, note }) => {
      const lines = [category.name.toLocaleUpperCase("vi-VN")];

      if (items.length > 0) {
        lines.push("", "Em thích:");
        for (const item of items) {
          const favoriteLabel =
            item.id === favoriteItemId ? " (Yêu thích nhất)" : "";
          lines.push(`- ${item.name}${favoriteLabel}`);

          const source = [item.sourceName, item.sourceUrl]
            .filter(Boolean)
            .join(" - ");
          if (source) lines.push(`  Nguồn tham khảo: ${source}`);
        }
      }

      if (note.trim()) {
        lines.push("", "Ghi chú:", note.trim());
      }

      return lines.join("\n");
    },
  );

  return [
    "NHỮNG ĐIỀU EM YÊU",
    ...sections.flatMap((section) => ["", section]),
    "",
    `Cập nhật lúc: ${formatUpdatedAt(selection.updatedAt)}`,
  ].join("\n");
}
