import * as THREE from "three";

export interface BendablePageOptions {
  width: number;
  depth: number;
  segmentsX: number;
  segmentsZ: number;
}

export interface BendablePageUpdateOptions {
  width: number;
  maxAngle: number;
}

interface BendablePageUserData {
  basePositions?: Float32Array;
}

function positiveFinite(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function segmentCount(value: number) {
  return Math.max(1, Math.floor(Number.isFinite(value) ? value : 1));
}

export function createBendablePageGeometry({
  width: requestedWidth,
  depth: requestedDepth,
  segmentsX: requestedSegmentsX,
  segmentsZ: requestedSegmentsZ,
}: BendablePageOptions): THREE.BufferGeometry {
  const width = positiveFinite(requestedWidth, 1);
  const depth = positiveFinite(requestedDepth, 1);
  const segmentsX = segmentCount(requestedSegmentsX);
  const segmentsZ = segmentCount(requestedSegmentsZ);
  const vertexCount = (segmentsX + 1) * (segmentsZ + 1);
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  for (let zIndex = 0; zIndex <= segmentsZ; zIndex += 1) {
    const normalizedZ = zIndex / segmentsZ;

    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const normalizedX = xIndex / segmentsX;
      const vertexIndex = zIndex * (segmentsX + 1) + xIndex;
      const positionOffset = vertexIndex * 3;
      const uvOffset = vertexIndex * 2;

      positions[positionOffset] = width * normalizedX;
      positions[positionOffset + 1] = 0;
      positions[positionOffset + 2] = normalizedZ * depth - depth / 2;
      uvs[uvOffset] = normalizedX;
      uvs[uvOffset + 1] = normalizedZ;
    }
  }

  for (let zIndex = 0; zIndex < segmentsZ; zIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const rowStart = zIndex * (segmentsX + 1) + xIndex;
      const nextRowStart = (zIndex + 1) * (segmentsX + 1) + xIndex;

      indices.push(
        rowStart,
        nextRowStart,
        rowStart + 1,
        rowStart + 1,
        nextRowStart,
        nextRowStart + 1,
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.userData = {
    ...(geometry.userData as BendablePageUserData),
    basePositions: positions.slice(),
  };
  geometry.computeVertexNormals();
  return geometry;
}

export function updateBendablePageGeometry(
  geometry: THREE.BufferGeometry,
  progress: number,
  { width: requestedWidth, maxAngle: requestedMaxAngle }: BendablePageUpdateOptions,
) {
  const position = geometry.getAttribute("position");
  const userData = geometry.userData as BendablePageUserData;
  const basePositions = userData.basePositions;

  if (!basePositions || basePositions.length !== position.array.length) {
    throw new Error("Bendable page geometry is missing its base positions.");
  }

  const width = positiveFinite(requestedWidth, 1);
  const maxAngle = positiveFinite(requestedMaxAngle, Math.PI * 0.9);
  const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);

  if (clampedProgress === 0) {
    position.array.set(basePositions);
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return;
  }

  const totalAngle = Math.max(0.001, maxAngle * clampedProgress);
  const radius = width / totalAngle;

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
    const offset = vertexIndex * 3;
    const baseX = basePositions[offset];
    const normalizedX = THREE.MathUtils.clamp(baseX / width, 0, 1);
    const theta = totalAngle * normalizedX;

    position.array[offset] = radius * Math.sin(theta);
    position.array[offset + 1] = radius * (1 - Math.cos(theta));
    position.array[offset + 2] = basePositions[offset + 2];
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
