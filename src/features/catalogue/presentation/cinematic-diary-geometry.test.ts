import { describe, expect, it } from "vitest";
import {
  createBendablePageGeometry,
  updateBendablePageGeometry,
} from "./cinematic-diary-geometry";

describe("bendable diary pages", () => {
  it("creates a subdivided sheet with position and uv attributes", () => {
    const geometry = createBendablePageGeometry({
      width: 3,
      depth: 4,
      segmentsX: 12,
      segmentsZ: 8,
    });

    expect(geometry.getAttribute("position").count).toBe((12 + 1) * (8 + 1));
    expect(geometry.getAttribute("uv").count).toBe((12 + 1) * (8 + 1));
    geometry.dispose();
  });

  it("keeps the spine edge fixed while the far edge lifts during a curl", () => {
    const geometry = createBendablePageGeometry({
      width: 3,
      depth: 4,
      segmentsX: 12,
      segmentsZ: 8,
    });
    const position = geometry.getAttribute("position");
    const spineX = position.getX(0);
    const spineY = position.getY(0);

    updateBendablePageGeometry(geometry, 0.7, {
      width: 3,
      maxAngle: Math.PI * 0.9,
    });

    expect(position.getX(0)).toBeCloseTo(spineX);
    expect(position.getY(0)).toBeCloseTo(spineY);
    expect(position.getY(12)).toBeGreaterThan(spineY);
    geometry.dispose();
  });

  it("clamps progress and restores the original flat sheet at zero", () => {
    const geometry = createBendablePageGeometry({
      width: 3,
      depth: 4,
      segmentsX: 12,
      segmentsZ: 8,
    });
    const position = geometry.getAttribute("position");
    const originalFarX = position.getX(12);
    const originalFarY = position.getY(12);

    updateBendablePageGeometry(geometry, 2, {
      width: 3,
      maxAngle: Math.PI * 0.9,
    });
    updateBendablePageGeometry(geometry, -1, {
      width: 3,
      maxAngle: Math.PI * 0.9,
    });

    expect(position.getX(12)).toBeCloseTo(originalFarX);
    expect(position.getY(12)).toBeCloseTo(originalFarY);
    geometry.dispose();
  });
});
