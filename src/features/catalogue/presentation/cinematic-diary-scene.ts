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
const DUST_COUNT = 300;
const BOOK_SIZE = 3.42;
const PAGE_WIDTH = BOOK_SIZE - 0.24;
const PAGE_DEPTH = BOOK_SIZE - 0.24;

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

function createPageBlockGeometry(width: number, height: number, depth: number, radius: number = 0.06) {
  const shape = new THREE.Shape();
  // Start after top-left corner
  shape.moveTo(radius, 0);
  // Top edge
  shape.lineTo(width - radius, 0);
  // Top-right corner
  shape.quadraticCurveTo(width, 0, width, radius);
  // Right edge (fore-edge, concave)
  shape.quadraticCurveTo(width - 0.08, depth / 2, width, depth - radius); 
  // Bottom-right corner
  shape.quadraticCurveTo(width, depth, width - radius, depth);
  // Bottom edge
  shape.lineTo(radius, depth);
  // Bottom-left corner
  shape.quadraticCurveTo(0, depth, 0, depth - radius);
  // Left edge (spine edge, flat to avoid poking through cover hinge)
  shape.lineTo(0, radius);
  // Top-left corner
  shape.quadraticCurveTo(0, 0, radius, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.006,
    bevelThickness: 0.006,
    curveSegments: 16,
  });
  // ExtrudeGeometry extrudes along Z, we want it along Y
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  return geometry;
}

function createRibbonGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -BOOK_SIZE / 2),
    new THREE.Vector3(0.1, 0, 0),
    new THREE.Vector3(0.3, -0.05, BOOK_SIZE / 2 + 0.1),
    new THREE.Vector3(0.4, -0.2, BOOK_SIZE / 2 + 0.6),
    new THREE.Vector3(0.8, -0.6, BOOK_SIZE / 2 + 1.2),
  ]);
  const geometry = new THREE.TubeGeometry(curve, 64, 0.08, 4, false);
  // Flatten it into a ribbon
  geometry.scale(1, 0.04, 1);
  return geometry;
}

// Generates a procedural noise canvas for bump maps
function createNoiseTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)";
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
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
  // Enable shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

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
  const textures: THREE.Texture[] = [];
  
  const registerGeometry = <T extends THREE.BufferGeometry>(geometry: T) => {
    geometries.push(geometry);
    return geometry;
  };
  const registerMaterial = <T extends THREE.Material>(material: T) => {
    materials.push(material);
    return material;
  };
  const registerTexture = <T extends THREE.Texture>(texture: T) => {
    textures.push(texture);
    return texture;
  };

  const noiseTexture = registerTexture(createNoiseTexture());

  const journal = new THREE.Group();
  journal.rotation.set(-0.46, -0.12, 0.12);
  scene.add(journal);

  const leatherMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.brandStrong, "#3b0d14"),
      roughness: 0.7,
      metalness: 0.1,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
      sheen: 1.0,
      sheenRoughness: 0.4,
      sheenColor: color(palette.accent, "#c5a059"),
      bumpMap: noiseTexture,
      bumpScale: 0.002,
    }),
  );
  
  const leatherEdgeMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.brand, "#650c1c"),
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.4,
      clearcoatRoughness: 0.4,
      bumpMap: noiseTexture,
      bumpScale: 0.001,
    }),
  );
  
  const paperMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.paper, "#fff9f3"),
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
  );

  // Striped texture for realistic page edges
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = 16;
  edgeCanvas.height = 128;
  const edgeCtx = edgeCanvas.getContext("2d");
  if (edgeCtx) {
    edgeCtx.fillStyle = "#fcf6f0";
    edgeCtx.fillRect(0, 0, 16, 128);
    edgeCtx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 128; i += 3) {
      edgeCtx.fillRect(0, i, 16, 1.5);
    }
  }
  const edgeTexture = registerTexture(new THREE.CanvasTexture(edgeCanvas));
  edgeTexture.wrapS = THREE.RepeatWrapping;
  edgeTexture.wrapT = THREE.RepeatWrapping;
  edgeTexture.repeat.set(1, 10);

  const paperEdgeMaterial = registerMaterial(
    new THREE.MeshStandardMaterial({
      color: color(palette.surface, "#f4ece6"),
      roughness: 0.85,
      metalness: 0.05,
      map: edgeTexture,
    }),
  );

  const brassMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.accent, "#c5a059"),
      roughness: 0.2,
      metalness: 0.95,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    }),
  );
  
  const heartMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.accent, "#e6c887"),
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.08,
    }),
  );

  const ribbonMaterial = registerMaterial(
    new THREE.MeshPhysicalMaterial({
      color: color(palette.brand, "#741f43"),
      roughness: 0.4,
      metalness: 0.1,
      sheen: 1.0,
      sheenRoughness: 0.2,
      sheenColor: color(palette.brandStrong, "#4a142a"),
      side: THREE.DoubleSide,
    })
  );

  // High-res typography textures
  const leftLetterCanvas = document.createElement("canvas");
  leftLetterCanvas.width = 2048;
  leftLetterCanvas.height = 2048;
  const leftLetterContext = leftLetterCanvas.getContext("2d");
  const leftLetterTexture = registerTexture(new THREE.CanvasTexture(leftLetterCanvas));
  leftLetterTexture.colorSpace = THREE.SRGBColorSpace;
  // Anti-aliasing boost
  leftLetterTexture.minFilter = THREE.LinearMipmapLinearFilter;
  leftLetterTexture.magFilter = THREE.LinearFilter;

  const rightLetterCanvas = document.createElement("canvas");
  rightLetterCanvas.width = 2048;
  rightLetterCanvas.height = 2048;
  const rightLetterContext = rightLetterCanvas.getContext("2d");
  const rightLetterTexture = registerTexture(new THREE.CanvasTexture(rightLetterCanvas));
  rightLetterTexture.colorSpace = THREE.SRGBColorSpace;
  rightLetterTexture.minFilter = THREE.LinearMipmapLinearFilter;
  rightLetterTexture.magFilter = THREE.LinearFilter;

  const drawLettering = (fillColor: string) => {
    if (!leftLetterContext || !rightLetterContext) return;

    // Left Page
    leftLetterContext.clearRect(0, 0, leftLetterCanvas.width, leftLetterCanvas.height);
    leftLetterContext.fillStyle = fillColor;
    leftLetterContext.textAlign = "center";
    leftLetterContext.textBaseline = "middle";
    // Soft shadow for physical ink effect
    leftLetterContext.shadowColor = "rgba(0, 0, 0, 0.2)";
    leftLetterContext.shadowBlur = 8;
    leftLetterContext.shadowOffsetY = 2;
    
    leftLetterContext.font = "bold italic 160px Georgia, Times New Roman, serif";
    leftLetterContext.fillText("Tháng Năm Của Chúng Ta", leftLetterCanvas.width / 2, leftLetterCanvas.height / 2 - 200);
    
    leftLetterContext.font = "bold italic 120px Georgia, Times New Roman, serif";
    leftLetterContext.fillText("Chương 1", leftLetterCanvas.width / 2, leftLetterCanvas.height / 2 + 100);

    leftLetterTexture.needsUpdate = true;

    // Right Page
    rightLetterContext.clearRect(0, 0, rightLetterCanvas.width, rightLetterCanvas.height);
    rightLetterContext.fillStyle = fillColor;
    rightLetterContext.textAlign = "center";
    rightLetterContext.textBaseline = "middle";
    rightLetterContext.shadowColor = "rgba(0, 0, 0, 0.2)";
    rightLetterContext.shadowBlur = 8;
    rightLetterContext.shadowOffsetY = 2;

    rightLetterContext.font = "bold italic 140px Georgia, Times New Roman, serif";
    rightLetterContext.fillText("Mỗi khoảnh khắc bên em", rightLetterCanvas.width / 2, rightLetterCanvas.height / 2 - 150);
    rightLetterContext.fillText("đều là một trang nhật ký", rightLetterCanvas.width / 2, rightLetterCanvas.height / 2 + 50);
    rightLetterContext.fillText("tuyệt đẹp.", rightLetterCanvas.width / 2, rightLetterCanvas.height / 2 + 250);
    
    rightLetterContext.font = "bold italic 90px Georgia, Times New Roman, serif";
    rightLetterContext.fillText("- Gửi em, tình yêu của anh.", rightLetterCanvas.width / 2, rightLetterCanvas.height / 2 + 550);

    rightLetterTexture.needsUpdate = true;
  };
  drawLettering(palette.brandStrong || "#4a142a");

  // Using polygonOffset completely eliminates Z-fighting/blinking
  const rightLetterMaterial = registerMaterial(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthWrite: false,
      map: rightLetterTexture,
      opacity: 0.85,
      side: THREE.DoubleSide,
      transparent: true,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
  );

  const leftLetterMaterial = registerMaterial(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthWrite: false,
      map: leftLetterTexture,
      opacity: 0.85,
      side: THREE.DoubleSide,
      transparent: true,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }),
  );

  const coverThickness = 0.08;
  const pageStackY = 0.1;
  const frontCoverY = 0.24;
  const spineX = -1.68;

  const rearCover = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(BOOK_SIZE, coverThickness, BOOK_SIZE, 5, 0.09)),
    leatherMaterial,
  );
  rearCover.position.set(0, -0.04, 0);
  rearCover.castShadow = true;
  rearCover.receiveShadow = true;
  journal.add(rearCover);

  const spine = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(0.24, 0.36, BOOK_SIZE + 0.08, 5, 0.09)),
    leatherEdgeMaterial,
  );
  spine.position.set(spineX, 0.1, 0);
  spine.castShadow = true;
  journal.add(spine);

  // Advanced Page Block using ExtrudeGeometry
  const pageBlockGeom = registerGeometry(createPageBlockGeometry(3.24, 0.2, 3.36));
  // ExtrudeGeometry gives index 0 to extruded faces (top/bottom) and index 1 to sides
  const pageBlock = new THREE.Mesh(pageBlockGeom, [paperMaterial, paperEdgeMaterial]);
  pageBlock.position.set(0.06, 0.1, 0);
  pageBlock.castShadow = true;
  pageBlock.receiveShadow = true;
  journal.add(pageBlock);

  // The ribbon
  const ribbon = new THREE.Mesh(registerGeometry(createRibbonGeometry()), ribbonMaterial);
  ribbon.position.set(0.6, 0.201, 0);
  ribbon.castShadow = true;
  journal.add(ribbon);

  const frontHinge = new THREE.Group();
  frontHinge.position.set(spineX, frontCoverY, 0);
  journal.add(frontHinge);

  const frontCover = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(BOOK_SIZE, coverThickness, BOOK_SIZE, 5, 0.09)),
    leatherMaterial,
  );
  frontCover.position.set(1.68, 0, 0);
  frontCover.castShadow = true;
  frontCover.receiveShadow = true;
  frontHinge.add(frontCover);

  const brassTitlePlate = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(0.86, 0.018, 0.38, 4, 0.05)),
    brassMaterial,
  );
  brassTitlePlate.position.set(1.68 - 0.025, coverThickness / 2 + 0.018, 0.12);
  brassTitlePlate.castShadow = true;
  frontHinge.add(brassTitlePlate);

  const brassRule = new THREE.Mesh(
    registerGeometry(new RoundedBoxGeometry(1.85, 0.014, 0.025, 3, 0.01)),
    brassMaterial,
  );
  brassRule.position.set(1.68 - 0.025, coverThickness / 2 + 0.016, -BOOK_SIZE / 2 + 0.25);
  brassRule.castShadow = true;
  frontHinge.add(brassRule);

  const bendablePages: Array<{
    geometry: THREE.BufferGeometry;
    mesh: THREE.Mesh;
    index: number;
  }> = [];
  const pageCount = 4;
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
    page.position.set(1.68 - BOOK_SIZE / 2 + 0.12, pageStackY + index * 0.014, 0);
    page.castShadow = true;
    page.receiveShadow = true;
    journal.add(page);
    bendablePages.push({ geometry, index, mesh: page });
  }

  const heartMark = new THREE.Mesh(registerGeometry(createHeartGeometry()), heartMaterial);
  heartMark.rotation.x = Math.PI / 2;
  heartMark.position.set(0.82, 0.201, -0.06);
  heartMark.scale.setScalar(0.26);
  journal.add(heartMark);

  // Right typography (on top of pageBlock, Z-fighting disabled via polygonOffset)
  const rightLetterMark = new THREE.Mesh(
    registerGeometry(new THREE.PlaneGeometry(2.8, 2.8)),
    rightLetterMaterial,
  );
  rightLetterMark.rotation.x = -Math.PI / 2;
  // Placed perfectly flush, polygonOffset ensures no clipping
  rightLetterMark.position.set(0.06, 0.2, 0.0);
  rightLetterMark.scale.setScalar(0.92);
  journal.add(rightLetterMark);

  // Left typography (on inside of front cover)
  const leftLetterMark = new THREE.Mesh(
    registerGeometry(new THREE.PlaneGeometry(2.8, 2.8)),
    leftLetterMaterial,
  );
  // Rotate so it reads correctly and faces UP when opened
  leftLetterMark.rotation.set(Math.PI / 2, 0, Math.PI);
  leftLetterMark.scale.setScalar(0.92);
  // Placed perfectly flush to inside of cover
  leftLetterMark.position.set(1.68, -coverThickness / 2, 0.0);
  frontHinge.add(leftLetterMark);

  // Drop Shadow for the entire book
  const shadowMaterial = registerMaterial(
    new THREE.MeshBasicMaterial({
      color: color(palette.brandStrong, "#4a142a"),
      depthWrite: false,
      opacity: 0.25,
      transparent: true,
    }),
  );
  const shadow = new THREE.Mesh(
    registerGeometry(new THREE.PlaneGeometry(8.0, 6.5)),
    shadowMaterial,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.15, -0.66, 0.25);
  shadow.scale.set(1.04, 0.82, 1);
  scene.add(shadow);

  // Magical Cinematic Dust System
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustPhases = new Float32Array(DUST_COUNT);
  for (let index = 0; index < DUST_COUNT; index += 1) {
    const offset = index * 3;
    dustPositions[offset] = (Math.random() - 0.5) * 10.0;
    dustPositions[offset + 1] = Math.random() * 6.0 - 2.0;
    dustPositions[offset + 2] = (Math.random() - 0.5) * 8.0;
    dustPhases[index] = Math.random() * Math.PI * 2;
  }
  const dustGeometry = registerGeometry(new THREE.BufferGeometry());
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("phase", new THREE.BufferAttribute(dustPhases, 1));
  
  // Custom Shader for Dust to make them twinkle
  const dustMaterial = registerMaterial(
    new THREE.PointsMaterial({
      color: color(palette.accent, "#e6ad58"),
      depthWrite: false,
      opacity: 0.4,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
  );
  
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  // Cinematic Lighting
  const ambientLight = new THREE.AmbientLight(color(palette.paper, "#fff8ec"), 2.0);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(color(palette.paper, "#ffffff"), 4.0);
  keyLight.position.set(-4, 6, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const warmLight = new THREE.PointLight(color(palette.accent, "#e6ad58"), 20, 15, 2);
  warmLight.position.set(3, 4, 3);
  scene.add(warmLight);

  const rimLight = new THREE.PointLight(color(palette.brand, "#741f43"), 10, 10, 2);
  rimLight.position.set(-3, -2, -4);
  scene.add(rimLight);

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

    heartMaterial.opacity = 0.08 + pageRevealProgress * 0.82;
    heartMark.scale.setScalar(0.22 + readingProgress * 0.05);
    rightLetterMaterial.opacity = 0.04 + readingProgress * 0.96;
    rightLetterMark.scale.setScalar(0.88 + readingProgress * 0.08);
    leftLetterMaterial.opacity = 0.04 + readingProgress * 0.96;
    leftLetterMark.scale.setScalar(0.88 + readingProgress * 0.08);

    // Subtle parallax and breathing animation
    journal.rotation.x =
      -0.46 + renderedPointerY * 0.06 + Math.sin(time * 0.8) * 0.015 * idle;
    journal.rotation.y = -0.12 + renderedPointerX * 0.15;
    journal.rotation.z = 0.12 + renderedPointerX * 0.04;
    journal.position.y =
      Math.sin(time * 1.1) * 0.06 * idle + coverProgress * 0.06 + readingProgress * 0.02;
    
    shadow.scale.x = 1.04 - coverProgress * 0.13;
    shadowMaterial.opacity = 0.25 - coverProgress * 0.08;

    // Animate Magical Dust
    dust.rotation.y = time * 0.05;
    const positions = dustGeometry.attributes.position.array as Float32Array;
    const phases = dustGeometry.attributes.phase.array as Float32Array;
    for (let i = 0; i < DUST_COUNT; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + phases[i]) * 0.002; // Float up and down
    }
    dustGeometry.attributes.position.needsUpdate = true;
    dustMaterial.opacity = 0.2 + pageRevealProgress * 0.6 - readingProgress * 0.2;

    warmLight.intensity = 20 + pageRevealProgress * 10 + readingProgress * 5;

    const closedPosition = isNarrowViewport ? closedCameraPositionNarrow : closedCameraPosition;
    const openPosition = isNarrowViewport ? openCameraPositionNarrow : openCameraPosition;
    const readingPosition = isNarrowViewport ? readingCameraPositionNarrow : readingCameraPosition;
    
    // Parallax Camera movement
    const parallaxX = renderedPointerX * 0.2;
    const parallaxY = renderedPointerY * 0.15;
    
    camera.position.lerpVectors(closedPosition, openPosition, coverProgress);
    camera.position.lerp(readingPosition, readingProgress);
    camera.position.x += parallaxX;
    camera.position.y += parallaxY;
    
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
    paperEdgeMaterial.color.set(nextPalette.surface || "#f4ece6");
    brassMaterial.color.set(nextPalette.accent || "#e6ad58");
    heartMaterial.color.set(nextPalette.accent || "#e6ad58");
    ribbonMaterial.color.set(nextPalette.brand || "#741f43");
    drawLettering(nextPalette.brandStrong || "#4a142a");
    shadowMaterial.color.set(nextPalette.brandStrong || "#4a142a");
    dustMaterial.color.set(nextPalette.accent || "#e6ad58");
    ambientLight.color.set(nextPalette.paper || "#fff8ec");
    keyLight.color.set(nextPalette.paper || "#ffffff");
    warmLight.color.set(nextPalette.accent || "#e6ad58");
    rimLight.color.set(nextPalette.brand || "#741f43");
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
      textures.forEach((texture) => texture.dispose());
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
