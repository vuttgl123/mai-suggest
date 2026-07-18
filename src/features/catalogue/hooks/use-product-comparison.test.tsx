import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PreferenceItem } from "@/types/preference";
import { useProductComparison } from "./use-product-comparison";

function item(id: string): PreferenceItem {
  return { id } as PreferenceItem;
}

describe("useProductComparison", () => {
  it("toggles unique items and limits comparison to three", () => {
    const items = [item("one"), item("two"), item("three"), item("four")];
    const { result } = renderHook(() =>
      useProductComparison({ categoryId: "gifts", items }),
    );

    act(() => {
      result.current.toggle("one");
      result.current.toggle("two");
      result.current.toggle("three");
      result.current.toggle("four");
    });
    expect(result.current.itemIds).toEqual(["one", "two", "three"]);
    expect(result.current.canAdd("four")).toBe(false);

    act(() => result.current.toggle("two"));
    expect(result.current.itemIds).toEqual(["one", "three"]);
  });

  it("clears when category changes and removes filtered-out items", () => {
    const { result, rerender } = renderHook(
      ({ categoryId, items }) => useProductComparison({ categoryId, items }),
      {
        initialProps: {
          categoryId: "gifts",
          items: [item("one"), item("two")],
        },
      },
    );

    act(() => {
      result.current.toggle("one");
      result.current.toggle("two");
    });
    rerender({ categoryId: "gifts", items: [item("one")] });
    expect(result.current.itemIds).toEqual(["one"]);

    rerender({ categoryId: "bags", items: [item("bag-one")] });
    expect(result.current.itemIds).toEqual([]);
    act(() => result.current.toggle("missing"));
    expect(result.current.itemIds).toEqual([]);
  });

  it("clears explicitly", () => {
    const { result } = renderHook(() =>
      useProductComparison({ categoryId: "gifts", items: [item("one")] }),
    );
    act(() => result.current.toggle("one"));
    act(() => result.current.clear());
    expect(result.current.itemIds).toEqual([]);
  });
});
