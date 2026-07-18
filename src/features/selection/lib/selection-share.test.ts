import { describe, expect, it, vi } from "vitest";
import { createSelectionFile, shareSelection } from "./selection-share";

function navigatorWith(
  share: ((data: ShareData) => Promise<void>) | undefined,
  writeText = vi.fn().mockResolvedValue(undefined),
) {
  return {
    share,
    clipboard: { writeText },
  } as Pick<Navigator, "share" | "clipboard">;
}

describe("selection sharing", () => {
  it("uses Web Share when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const clipboard = vi.fn().mockResolvedValue(undefined);

    await expect(
      shareSelection({
        text: "Nội dung",
        title: "Điều Em Yêu",
        navigator: navigatorWith(share, clipboard),
      }),
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Điều Em Yêu",
      text: "Nội dung",
    });
    expect(clipboard).not.toHaveBeenCalled();
  });

  it("falls back to clipboard when sharing is unavailable or not allowed", async () => {
    const clipboard = vi.fn().mockResolvedValue(undefined);
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException("Not allowed", "NotAllowedError"));

    await expect(
      shareSelection({
        text: "Nội dung",
        title: "Điều Em Yêu",
        navigator: navigatorWith(share, clipboard),
      }),
    ).resolves.toBe("copied");
    expect(clipboard).toHaveBeenCalledWith("Nội dung");
  });

  it("treats user cancellation as handled without copying", async () => {
    const clipboard = vi.fn().mockResolvedValue(undefined);
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException("Cancelled", "AbortError"));

    await expect(
      shareSelection({
        text: "Nội dung",
        title: "Điều Em Yêu",
        navigator: navigatorWith(share, clipboard),
      }),
    ).resolves.toBe("shared");
    expect(clipboard).not.toHaveBeenCalled();
  });

  it("creates a UTF-8 text file with an ASCII filename", () => {
    const file = createSelectionFile("Những điều em yêu");

    expect(file.filename).toBe("dieu-em-yeu.txt");
    expect(file.blob.type).toBe("text/plain;charset=utf-8");
    expect(file.blob.size).toBeGreaterThan(0);
  });
});
