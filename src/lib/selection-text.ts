import type {
  PreferenceData,
  PreferenceSelectionState,
} from "@/types/preference";

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
  const sections = data.categories.flatMap((category) => {
    const likedItems = category.items.filter((item) =>
      selection.likedItemIds.includes(item.id),
    );
    const favoriteId = selection.favoriteByCategory[category.id];
    const favoriteItem = category.items.find((item) => item.id === favoriteId);
    const note = selection.notesByCategory[category.id]?.trim();

    if (likedItems.length === 0 && !note) return [];

    const lines = [category.name.toLocaleUpperCase("vi-VN")];

    if (likedItems.length > 0) {
      lines.push("", "❤️ Em thích:");
      lines.push(...likedItems.map((item) => `- ${item.name}`));
    }

    if (favoriteItem) {
      lines.push("", "⭐ Em thích nhất:", `- ${favoriteItem.name}`);
    }

    if (note) {
      lines.push("", "Ghi chú:", note);
    }

    return [lines.join("\n")];
  });

  return [
    "NHỮNG ĐIỀU EM YÊU",
    ...sections.flatMap((section) => ["", section]),
    "",
    `Cập nhật lúc: ${formatUpdatedAt(selection.updatedAt)}`,
  ].join("\n");
}
