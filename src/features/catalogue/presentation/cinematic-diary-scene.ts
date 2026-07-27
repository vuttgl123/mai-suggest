"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  createBendablePageGeometry,
  updateBendablePageGeometry,
} from "@/features/catalogue/presentation/cinematic-diary-geometry";

export interface CinematicDiaryPalette {
  accent: string;
  brand: string;
  brandStrong: string;
  paper: string;
  surface: string;
}

export interface CinematicDiaryScene {
  dispose(): void;
  resize(width: number, height: number): void;
  setActive(isActive: boolean): void;
  setPalette(palette: CinematicDiaryPalette): void;
  setPointer(x: number, y: number): void;
  setProgress(progress: number): void;
}

const MAX_PIXEL_RATIO = 1.5;
const DUST_COUNT = 42;
const PAGE_WIDTH = 3.02;
const PAGE_DEPTH = 4.05;

function color(value: string, fallback: string) {
  return new THREE.Color(value || fallback);
}

function createHeartGeometry() {
  const heart = new THREE.Shape();
  heart.moveTo(0, 0.2);
  heart.bezierCurveTo(-0.52, 0.62, -1.02, 0.12, 0, -0.62);
  heart.bezierCurveTo(1.02, 0.12, 0.52, 0.62, 0, 0.2);

  const geometry = new THREE.ExtrudeGeometry(heart, {
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.018,
    bevelThickness: 0.012,
    depth: 0.028,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

export function createCinematicDiaryScene(
  canvas: HTMLCanvasElement,
  palette: CinematicDiaryPalette,
): CinematicDiaryScene {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const closedCameraPosition = new THREE.Vector3(0, 2.9, 8.35);
  const closedCameraPositionNarrow = new THREE.Vector3(0, 3.2, 9.6);
  const openCameraPosition = new THREE.Vector3(0, 3.55, 6.15);
  const openCameraPositionNarrow = new THREE.Vector3(0, 3.75, 7.5);
  const readingCameraPosition = new THREE.Vector3(0, 4.08, 5.45);
  const readingCameraPositionNarrow = new THREE.Vector3(0, 4.35, 6.6);
  const closedCameraTarget = new THREE.Vector3(0, 0, 0);
  const readingCameraTarget = new THREE.Vector3(-0.14, 0.04, 0.06);
  const cameraTarget = new THREE.Vector3();
  camera.position.copy(closedCameraPosition);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const registerGeometry = <T extends THREE.BufferGeometry>(geometry: T) => {
    geometries.push(geometry);
    return geometry;
  };
  const registerMaterial = <T extends THREE.Material>(material: T) => {
    materials.push(material);
    return material;
  };

  const journal = new THREE.Group();
  journal.rotation.set(-0.46, -0.12, 0.12);
  scene.add(journal);

  const leatherMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.brandStrong, "#4a142a"),
      roughness: 0.5,
      metalness: 0.02,
      clearcoat: 0.22,
      clearcoatRoughness: 0.58,
    }),
  );
  const leatherEdgeMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.brand, "#741f43"),
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.28,
      clearcoatRoughness: 0.5,
    }),
  );
  const paperMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.paper, "#fff8ec"),
      roughness: 0.86,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
  );
  const paperEdgeMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.surface, "#f6e7d8"),
      roughness: 0.72,
      metalness: 0,
    }),
  );
  const brassMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.accent, "#e6ad58"),
      roughness: 0.28,
      metalness: 0.78,
      clearcoat: 0.28,
      clearcoatRoughness: 0.38,
    }),
  );
  const heartMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.accent, "#e6ad58"),
      roughness: 0.38,
      metalness: 0.62,
      clearcoat: 0.18,
      clearcoatRoughness: 0.42,
      transparent: true,
      opacity: 0.08,
    }),
  );

  const coverThickness = 0.15;
  const pageStackY = 0.08;
  const frontCoverY = 0.23;

  const rearCover = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(3.25, coverThickness, 4.38, 5, 0.09)),
    leatherMaterial,
  );
  rearCover.position.y = -0.21;
  journal.add(rearCover);

  const spine = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(0.22, 0.58, 4.46, 5, 0.09)),
    leatherEdgeMaterial,
  );
  spine.position.set(-1.56, -0.02, 0);
  journal.add(spine);

  const pageBlock = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(3.08, 0.2, 4.12, 5, 0.065)),
    paperEdgeMaterial,
  );
  pageBlock.position.y = -0.036;
  journal.add(pageBlock);

  const frontHinge = new THREE.Group();
  frontHinge.position.set(-1.56, frontCoverY, 0);
  journal.add(frontHinge);

  const frontCover = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(3.25, coverThickness, 4.38, 5, 0.09)),
    leatherMaterial,
  );
  frontCover.position.set(1.625, 0, 0);
  frontHinge.add(frontCover);

  const brassTitlePlate = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(0.86, 0.018, 0.38, 4, 0.05)),
    brassMaterial,
  );
  brassTitlePlate.position.set(1.6, coverThickness / 2 + 0.018, 0.12);
  frontHinge.add(brassTitlePlate);

  const brassRule = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(1.85, 0.014, 0.025, 3, 0.01)),
    brassMaterial,
  );
  brassRule.position.set(1.6, coverThickness / 2 + 0.016, -1.5);
  frontHinge.add(brassRule);

  const bendablePages: Array<{
    geometry: THREE.BufferGeometry;
    mesh: THREE.Mesh;
    index: number;
  }> = [];
  const pageCount = 2;
  for (let index = 0; index < pageCount; index += 1) {
    const geometry = registerGeometry(
      createBendablePageGeometry({
        width: PAGE_WIDTH,
        depth: PAGE_DEPTH,
        segmentsX: 14,
        segmentsZ: 10,
      }),
    );
    const page = new THREE.Mesh(geometry, paperMaterial);
    page.position.set(-1.5, pageStackY + index * 0.014, 0);
    journal.add(page);
    bendablePages.push({ geometry, index, mesh: page });
  }

  const spreadDetailMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.brand, "#741f43"),
      roughness: 0.78,
      metalness: 0,
      transparent: true,
      opacity: 0.1,
    }),
  );
  const spreadRule = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(1.22, 0.009, 0.022, 3, 0.008)),
    spreadDetailMaterial,
  );
  spreadRule.position.set(0.62, 0.11, -1.35);
  journal.add(spreadRule);

  const heartMark = new THREE.Mesh(registerGeometry(createHeartGeometry()), heartMaterial);
  heartMark.rotation.x = Math.PI / 2;
  heartMark.position.set(0.82, 0.12, -0.06);
  heartMark.scale.setScalar(0.26);
  journal.add(heartMark);

  const shadowMaterial = registerMaterial(
    new THREE.MeshBasicMaterial({
      color: color(palette.brandStrong, "#4a142a"),
      depthWrite: false,
      opacity: 0.16,
      transparent: true,
    }),
  );
  const shadow = new THREE.Mesh(
    registerGeometry(new THREE.PlaneGeometry(7.4, 6.2)),
    shadowMaterial,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.15, -0.66, 0.25);
  shadow.scale.set(1.04, 0.82, 1);
  scene.add(shadow);

  const pageCurlShadowMaterial = registerMaterial(
    new THREE.MeshBasicMaterial({
      color: color(palette.brandStrong, "#4a142a"),
      depthWrite: false,
      opacity: 0.04,
      transparent: true,
    }),
  );
  const pageCurlShadow = new THREE.Mesh(
    registerGeometry(new THREE.PlaneGeometry(2.92, 3.86)),
    pageCurlShadowMaterial,
  );
  pageCurlShadow.rotation.x = -Math.PI / 2;
  pageCurlShadow.position.set(-0.02, 0.067, 0.02);
  journal.add(pageCurlShadow);

  const dustPositions = new Float32Array(DUST_COUNT * 3);
  for (let index = 0; index < DUST_COUNT; index += 1) {
    const offset = index * 3;
    dustPositions[offset] = Math.sin(index * 2.37) * 4.2;
    dustPositions[offset + 1] = ((index * 0.73) % 1) * 4.8 - 1.8;
    dustPositions[offset + 2] = Math.cos(index * 1.41) * 2.4;
  }
  const dustGeometry = registerGeometry(new THREE.BufferGeometry());
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = registerMaterial(
    new THREE.PointsMaterial({
      color: color(palette.accent, "#e6ad58"),
      depthWrite: false,
      opacity: 0.18,
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
    }),
  );
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.position.set(0, 0.1, -0.2);
  scene.add(dust);

  const ambientLight = new THREE.AmbientLight(color(palette.paper, "#fff8ec"), 1.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(color(palette.paper, "#fff8ec"), 3.1);
  keyLight.position.set(-3.2, 5.5, 4.4);
  scene.add(keyLight);

  const warmLight = new THREE.PointLight(color(palette.accent, "#e6ad58"), 14, 12, 2);
  warmLight.position.set(2.8, 2.3, 2.2);
  scene.add(warmLight);

  let targetProgress = 0;
  let renderedProgress = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let renderedPointerX = 0;
  let renderedPointerY = 0;
  let frameId = 0;
  let active = false;
  let disposed = false;
  let isNarrowViewport = false;

  const render = (timestamp: number) => {
    if (!active || disposed) {
      return;
    }

    renderedProgress = THREE.MathUtils.damp(renderedProgress, targetProgress, 9.5, 1 / 60);
    renderedPointerX = THREE.MathUtils.damp(renderedPointerX, targetPointerX, 8, 1 / 60);
    renderedPointerY = THREE.MathUtils.damp(renderedPointerY, targetPointerY, 8, 1 / 60);

    const coverProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.16, 0.42);
    const pageRevealProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.32, 0.72);
    const readingProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.72, 0.9);
    const idle = 1 - coverProgress;
    const time = timestamp * 0.001;

    frontHinge.rotation.z = THREE.MathUtils.lerp(0.015, Math.PI * 0.92, coverProgress);
    frontHinge.position.y = frontCoverY + Math.sin(coverProgress * Math.PI) * 0.012;

    bendablePages.forEach(({ geometry, index, mesh }) => {
      const staggeredProgress = THREE.MathUtils.clamp(
        (pageRevealProgress - index * 0.14) * 1.26,
        0,
        1,
      );
      updateBendablePageGeometry(geometry, staggeredProgress, {
        width: PAGE_WIDTH,
        maxAngle: Math.PI * (0.82 + index * 0.05),
      });
      mesh.position.y = pageStackY + index * 0.014 + Math.sin(time * 1.15 + index) * 0.002 * idle;
    });

    spreadDetailMaterial.opacity = 0.1 + readingProgress * 0.46;
    heartMaterial.opacity = 0.08 + pageRevealProgress * 0.82;
    heartMark.scale.setScalar(0.22 + readingProgress * 0.05);
    pageCurlShadowMaterial.opacity = 0.035 + pageRevealProgress * 0.09;
    pageCurlShadow.scale.set(1.04 - pageRevealProgress * 0.2, 0.82, 1);
    pageCurlShadow.rotation.z = -pageRevealProgress * 0.2;

    journal.rotation.x =
      -0.46 + renderedPointerY * 0.045 + Math.sin(time * 0.8) * 0.012 * idle;
    journal.rotation.y = -0.12 + renderedPointerX * 0.13;
    journal.rotation.z = 0.12 + renderedPointerX * 0.035;
    journal.position.y =
      Math.sin(time * 1.1) * 0.055 * idle + coverProgress * 0.06 + readingProgress * 0.02;
    shadow.scale.x = 1.04 - coverProgress * 0.13;
    shadowMaterial.opacity = 0.16 - coverProgress * 0.05;
    dust.rotation.y = time * 0.045 * (0.4 + pageRevealProgress);
    dust.position.y = 0.1 + Math.sin(time * 0.45) * 0.12 * (0.4 + pageRevealProgress);
    dustMaterial.opacity = 0.12 + pageRevealProgress * 0.34 - readingProgress * 0.12;
    warmLight.intensity = 14 + pageRevealProgress * 8 + readingProgress * 2;

    const closedPosition = isNarrowViewport
      ? closedCameraPositionNarrow
      : closedCameraPosition;
    const openPosition = isNarrowViewport ? openCameraPositionNarrow : openCameraPosition;
    const readingPosition = isNarrowViewport
      ? readingCameraPositionNarrow
      : readingCameraPosition;
    camera.position.lerpVectors(closedPosition, openPosition, coverProgress);
    camera.position.lerp(readingPosition, readingProgress);
    camera.position.x += renderedPointerX * 0.13;
    camera.position.y += renderedPointerY * 0.08;
    const cameraTargetProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.42, 0.9);
    cameraTarget.lerpVectors(closedCameraTarget, readingCameraTarget, cameraTargetProgress);
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };

  const resize = (width: number, height: number) => {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    isNarrowViewport = safeWidth < 640 || safeWidth / safeHeight < 0.78;
    journal.scale.setScalar(isNarrowViewport ? 0.82 : 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.setSize(safeWidth, safeHeight, false);
    camera.aspect = safeWidth / safeHeight;
    camera.updateProjectionMatrix();
  };

  resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);

  const setPalette = (nextPalette: CinematicDiaryPalette) => {
    leatherMaterial.color.set(nextPalette.brandStrong || "#4a142a");
    leatherEdgeMaterial.color.set(nextPalette.brand || "#741f43");
    paperMaterial.color.set(nextPalette.paper || "#fff8ec");
    paperEdgeMaterial.color.set(nextPalette.surface || "#f6e7d8");
    brassMaterial.color.set(nextPalette.accent || "#e6ad58");
    heartMaterial.color.set(nextPalette.accent || "#e6ad58");
    spreadDetailMaterial.color.set(nextPalette.brand || "#741f43");
    shadowMaterial.color.set(nextPalette.brandStrong || "#4a142a");
    pageCurlShadowMaterial.color.set(nextPalette.brandStrong || "#4a142a");
    dustMaterial.color.set(nextPalette.accent || "#e6ad58");
    ambientLight.color.set(nextPalette.paper || "#fff8ec");
    keyLight.color.set(nextPalette.paper || "#fff8ec");
    warmLight.color.set(nextPalette.accent || "#e6ad58");
  };

  return {
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
    resize,
    setActive(isActive) {
      if (disposed || active === isActive) {
        return;
      }
      active = isActive;
      if (active) {
        frameId = window.requestAnimationFrame(render);
      } else if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    },
    setPalette,
    setPointer(x, y) {
      targetPointerX = THREE.MathUtils.clamp(x, -1, 1);
      targetPointerY = THREE.MathUtils.clamp(y, -1, 1);
    },
    setProgress(progress) {
      targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
    },
  };
}
