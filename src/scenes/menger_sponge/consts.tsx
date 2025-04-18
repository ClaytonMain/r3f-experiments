import * as THREE from "three";

export const DPR = 1.0;
export const FOV = 45;

export const uniformDefaults = {
  uTime: 0,
  uCameraPosition: new THREE.Vector3(0, 0, 0),
  uResolution: new THREE.Vector2(
    window.innerWidth * DPR,
    window.innerHeight * DPR,
  ),
  uGlZ: -1 / (2 * Math.tan(FOV * (Math.PI / 180) * 0.5)),
  uFrameNumber: 0,

  uPaletteA: new THREE.Vector3(0.5, 0.5, 0.5),
  uPaletteB: new THREE.Vector3(0.5, 0.5, 0.5),
  uPaletteC: new THREE.Vector3(1.0, 1.0, 1.0),
  uPaletteD: new THREE.Vector3(0.56, -0.24, 0.04),
};
