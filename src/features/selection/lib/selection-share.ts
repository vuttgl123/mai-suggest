export function createSelectionFile(text: string): {
  blob: Blob;
  filename: string;
} {
  return {
    blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
    filename: "dieu-em-yeu.txt",
  };
}

interface ShareSelectionOptions {
  text: string;
  title: string;
  navigator: Pick<Navigator, "share" | "clipboard">;
}

export async function shareSelection({
  text,
  title,
  navigator,
}: ShareSelectionOptions): Promise<"shared" | "copied"> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "shared";
      }
    }
  }

  await navigator.clipboard.writeText(text);
  return "copied";
}
