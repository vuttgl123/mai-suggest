"use client";

import * as THREE from "three";

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

function color(value: string, fallback: string) {
  return new THREE.Color(value || fallback);
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
  const openCameraPosition = new THREE.Vector3(0, 3.55, 6.15);
  const readingCameraPosition = new THREE.Vector3(0, 4.08, 5.45);
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
      roughness: 0.46,
      metalness: 0.02,
      clearcoat: 0.24,
      clearcoatRoughness: 0.55,
    }),
  );
  const leatherEdgeMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.brand, "#741f43"),
      roughness: 0.38,
      metalness: 0.04,
      clearcoat: 0.3,
      clearcoatRoughness: 0.48,
    }),
  );
  const paperMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.paper, "#fff8ec"),
      roughness: 0.82,
      metalness: 0,
    }),
  );
  const paperEdgeMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.surface, "#f6e7d8"),
      roughness: 0.68,
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

  const rearCover = new THREE.Mesh(
    registerGeometry(new THREE.BoxGeometry(3.25, 0.16, 4.38, 4, 1, 4)),
    leatherMaterial,
  );
  rearCover.position.y = -0.18;
  journal.add(rearCover);

  const spine = new THREE.Mesh(
    registerGeometry(new THREE.BoxGeometry(0.18, 0.25, 4.46, 1, 1, 5)),
    leatherEdgeMaterial,
  );
  spine.position.set(-1.56, -0.04, 0);
  journal.add(spine);

  const pageBlock = new THREE.Mesh(
    registerGeometry(new THREE.BoxGeometry(3.08, 0.28, 4.12, 2, 1, 4)),
    paperEdgeMaterial,
  );
  pageBlock.position.y = 0.04;
  journal.add(pageBlock);

  const pages: THREE.Mesh[] = [];
  for (let index = 0; index < 7; index += 1) {
    const page = new THREE.Mesh(
      registerGeometry(new THREE.BoxGeometry(3.02, 0.018, 4.05, 1, 1, 3)),
      paperMaterial,
    );
    page.position.set(0.03 + (index % 2) * 0.015, 0.19 + index * 0.028, 0);
    page.rotation.z = (index - 3) * 0.004;
    journal.add(page);
    pages.push(page);
  }

  const frontHinge = new THREE.Group();
  frontHinge.position.set(-1.56, 0.09, 0);
  journal.add(frontHinge);

  const frontCover = new THREE.Mesh(
    registerGeometry(new THREE.BoxGeometry(3.25, 0.16, 4.38, 4, 1, 4)),
    leatherMaterial,
  );
  frontCover.position.set(1.625, 0, 0);
  frontHinge.add(frontCover);

  const brassBinding = new THREE.Mesh(
    registerGeometry(new THREE.BoxGeometry(3.3, 0.034, 0.1, 2, 1, 1)),
    brassMaterial,
  );
  brassBinding.position.set(1.625, 0.1, -1.78);
  frontHinge.add(brassBinding);

  const brassCorner = new THREE.Mesh(
    registerGeometry(new THREE.BoxGeometry(0.25, 0.04, 0.25)),
    brassMaterial,
  );
  brassCorner.position.set(3.0, 0.105, 1.98);
  frontHinge.add(brassCorner);

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
      opacity: 0.5,
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

  const warmLight = new THREE.PointLight(color(palette.accent, "#e6ad58"), 16, 12, 2);
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

  const render = (timestamp: number) => {
    if (!active || disposed) {
      return;
    }

    renderedProgress = THREE.MathUtils.damp(renderedProgress, targetProgress, 9.5, 1 / 60);
    renderedPointerX = THREE.MathUtils.damp(renderedPointerX, targetPointerX, 8, 1 / 60);
    renderedPointerY = THREE.MathUtils.damp(renderedPointerY, targetPointerY, 8, 1 / 60);

    const openingProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.16, 0.72);
    const readingProgress = THREE.MathUtils.smoothstep(renderedProgress, 0.72, 0.9);
    const idle = 1 - openingProgress;
    const time = timestamp * 0.001;

    frontHinge.rotation.z = THREE.MathUtils.lerp(0.015, Math.PI * 0.9, openingProgress);
    pages.forEach((page, index) => {
      const pageProgress = THREE.MathUtils.clamp((openingProgress - index * 0.08) * 1.35, 0, 1);
      page.rotation.z = (index - 3) * 0.002 + pageProgress * (0.006 + index * 0.001);
      page.position.y = 0.19 + index * 0.028 + Math.sin(time * 1.2 + index) * 0.004 * idle;
    });

    journal.rotation.x = -0.46 + renderedPointerY * 0.045 + Math.sin(time * 0.8) * 0.012 * idle;
    journal.rotation.y = -0.12 + renderedPointerX * 0.13;
    journal.rotation.z = 0.12 + renderedPointerX * 0.035;
    journal.position.y = Math.sin(time * 1.1) * 0.055 * idle + openingProgress * 0.06 + readingProgress * 0.02;
    shadow.scale.x = 1.04 - openingProgress * 0.13;
    shadowMaterial.opacity = 0.16 - openingProgress * 0.05;
    dust.rotation.y = time * 0.045;
    dust.position.y = 0.1 + Math.sin(time * 0.45) * 0.12;
    warmLight.intensity = 16 + openingProgress * 4 + readingProgress * 2;

    camera.position.lerpVectors(closedCameraPosition, openCameraPosition, openingProgress);
    camera.position.lerp(readingCameraPosition, readingProgress);
    camera.position.x += renderedPointerX * 0.13;
    camera.position.y += renderedPointerY * 0.08;
    cameraTarget.lerpVectors(closedCameraTarget, readingCameraTarget, readingProgress);
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };

  const resize = (width: number, height: number) => {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
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
    shadowMaterial.color.set(nextPalette.brandStrong || "#4a142a");
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
