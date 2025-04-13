import * as THREE from "three";

export const DPR = 1.0;

export const uniformDefaults = {
  uTime: 0,
  uCameraPosition: new THREE.Vector3(0, 0, 0),

  uPaletteA: new THREE.Vector3(0.5, 0.5, 0.5),
  uPaletteB: new THREE.Vector3(0.5, 0.5, 0.5),
  uPaletteC: new THREE.Vector3(1.0, 1.0, 1.0),
  uPaletteD: new THREE.Vector3(0.56, -0.24, 0.04),

  uDotRadius: 0.008,
  uDotSpacing: 0.1,
  uDotCenterRadius: 1.1,

  uRadialRepetitions: 150,

  uTanOscAmplitude: 0.6,
  uTanOscFrequency: 0.48,
  uTanOscPhaseSpeed: 0.15,

  uRadOscAmplitude: 0.14,
  uRadOscFrequency: 0.75,
  uRadOscPhaseSpeed: 0.26,
};
