import * as THREE from "three";

function getAgentData(
  gpuTextureWidth: number,
  gpuTextureHeight: number,
  displayWidth: number,
  displayHeight: number,
  startType: number,
) {
  const data = new Float32Array(gpuTextureWidth * gpuTextureHeight * 4);
  const choice = startType === -1 ? Math.floor(Math.random() * 6) : startType;
  for (let i = 0; i < gpuTextureWidth * gpuTextureHeight; i++) {
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    if (choice === 0) {
      // Center
      x = 0.5;
      y = 0.5;
      z = Math.random();
    } else if (choice === 1) {
      // Ring
      z = Math.random();
      x =
        0.5 + (Math.cos(z * Math.PI * 2) * 0.4 * displayHeight) / displayWidth;
      y = 0.5 + Math.sin(z * Math.PI * 2) * 0.4;
      if (Math.random() > 0.1) {
        z = (z + 0.5) % 1;
      }
    } else if (choice === 2) {
      // 9 Rings
      x = Math.round(Math.random() * 2) * 0.5;
      y = Math.round(Math.random() * 2) * 0.5;
      z = Math.random();
    } else if (choice === 3) {
      // Circle
      const p = Math.random();
      const r = Math.random() * 0.4;
      x = 0.5 + (Math.cos(p * Math.PI * 2) * r * displayHeight) / displayWidth;
      y = 0.5 + Math.sin(p * Math.PI * 2) * r;
      z = Math.random();
    } else if (choice === 4) {
      // Spiral
      const a = 20;
      const r = Math.random() * 0.45;
      x = 0.5 + (Math.cos(r * Math.PI * a) * r * displayHeight) / displayWidth;
      y = 0.5 + Math.sin(r * Math.PI * a) * r;
      z = Math.random();
    } else if (choice === 5) {
      // Fill
      x = Math.random();
      y = Math.random();
      z = Math.random();
    }

    const i4 = i * 4;
    data[i4 + 0] = x;
    data[i4 + 1] = y;
    data[i4 + 2] = z;
    data[i4 + 3] = 1.0;
  }
  return data;
}

export function getAgentDataTexture(
  gpuTextureWidth: number,
  gpuTextureHeight: number,
  displayTextureWidth: number,
  displayTextureHeight: number,
  startType: number = -1,
) {
  const data = getAgentData(
    gpuTextureWidth,
    gpuTextureHeight,
    displayTextureWidth,
    displayTextureHeight,
    startType,
  );
  const agentDataTexture = new THREE.DataTexture(
    data,
    gpuTextureWidth,
    gpuTextureHeight,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  agentDataTexture.needsUpdate = true;
  return agentDataTexture;
}

function getAgentPositionsData(
  displayTextureWidth: number,
  displayTextureHeight: number,
) {
  const data = new Float32Array(displayTextureWidth * displayTextureHeight * 4);
  for (let i = 0; i < displayTextureWidth * displayTextureHeight; i++) {
    const i4 = i * 4;
    data[i4 + 0] = 0.0;
    data[i4 + 1] = 0.0;
    data[i4 + 2] = 0.0;
    data[i4 + 3] = 1.0;
  }
  return data;
}

export function getAgentPositionsTexture(
  displayTextureWidth: number,
  displayTextureHeight: number,
) {
  const data = getAgentPositionsData(displayTextureWidth, displayTextureHeight);
  const agentPositionsTexture = new THREE.DataTexture(
    data,
    displayTextureWidth,
    displayTextureHeight,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  agentPositionsTexture.needsUpdate = true;
  return agentPositionsTexture;
}

function getTrailData(
  displayTextureWidth: number,
  displayTextureHeight: number,
) {
  const data = new Float32Array(displayTextureWidth * displayTextureHeight * 4);
  for (let i = 0; i < displayTextureWidth * displayTextureHeight; i++) {
    const i4 = i * 4;
    data[i4 + 0] = 0.0;
    data[i4 + 1] = 0.0;
    data[i4 + 2] = 0.0;
    data[i4 + 3] = 1.0;
  }
  return data;
}

export function getTrailTexture(
  displayTextureWidth: number,
  displayTextureHeight: number,
) {
  const data = getTrailData(displayTextureWidth, displayTextureHeight);
  const trailTexture = new THREE.DataTexture(
    data,
    displayTextureWidth,
    displayTextureHeight,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  trailTexture.needsUpdate = true;
  return trailTexture;
}
