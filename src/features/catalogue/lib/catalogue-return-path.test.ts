import { describe, expect, it } from "vitest";
import {
  createItemDetailPath,
  sanitizeCatalogueReturnPath,
} from "@/features/catalogue/lib/catalogue-return-path";

describe("sanitizeCatalogueReturnPath", () => {
  it("keeps a catalogue path with filters and page", () => {
    expect(sanitizeCatalogueReturnPath("/?category=quan-quen&q=c%C3%A0%20ph%C3%AA&page=2")).toBe(
      "/?category=quan-quen&q=c%C3%A0%20ph%C3%AA&page=2",
    );
    expect(sanitizeCatalogueReturnPath("/")).toBe("/");
  });

  it("rejects anything that could leave the site", () => {
    for (const value of [
      "//evil.example",
      "https://evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "catalogue",
      "",
      null,
      undefined,
    ]) {
      expect(sanitizeCatalogueReturnPath(value)).toBeNull();
    }
  });

  it("only accepts the home route, where the catalogue lives", () => {
    expect(sanitizeCatalogueReturnPath("/admin")).toBeNull();
    expect(sanitizeCatalogueReturnPath("/catalogue/x")).toBeNull();
  });

  it("takes the first value when the parameter repeats", () => {
    expect(sanitizeCatalogueReturnPath(["/?page=3", "//evil"])).toBe("/?page=3");
  });
});

describe("createItemDetailPath", () => {
  it("adds the return path only when it is not the default", () => {
    expect(createItemDetailPath("tiem-hoa", "/")).toBe("/catalogue/tiem-hoa");
    expect(createItemDetailPath("tiem-hoa", "/?category=qua&page=2")).toBe(
      "/catalogue/tiem-hoa?back=%2F%3Fcategory%3Dqua%26page%3D2",
    );
  });

  it("encodes the item slug", () => {
    expect(createItemDetailPath("cà phê", null)).toBe("/catalogue/c%C3%A0%20ph%C3%AA");
  });
});
