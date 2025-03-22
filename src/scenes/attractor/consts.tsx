import * as THREE from "three";

import {
  AttractorConfigs,
  AttractorName,
  AttractorParams,
  ColorMode,
  StyleParams,
} from "./types";

export const DEFAULT_PARTICLE_COUNT = 100000;
export const TEXTURE_WIDTH = Math.ceil(Math.sqrt(DEFAULT_PARTICLE_COUNT));

export const ATTRACTOR_NAMES: Array<AttractorName> = [
  "lorenz",
  "thomas",
  "aizawa",
  "dadras",
  "chen",
  "lorenz83",
  "rossler",
  "halvorsen",
  "rabinovich_fabrikant",
];

export const ATTRACTOR_CONFIGS: AttractorConfigs = {
  lorenz: {
    uAttractorId: 0,
    uSystemCenter: new THREE.Vector3(0, 0, 27),
    uPositionScale: 0.015,
    uVelocityScale: 0.001,
    uBaseTimeFactor: 0.1,
  },
  thomas: {
    uAttractorId: 1,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uPositionScale: 0.1,
    uVelocityScale: 0.1,
    uBaseTimeFactor: 1.0,
  },
  aizawa: {
    uAttractorId: 2,
    uSystemCenter: new THREE.Vector3(0.1, 0.1, 0.2),
    uPositionScale: 0.2,
    uVelocityScale: 0.03,
    uBaseTimeFactor: 0.3,
  },
  dadras: {
    uAttractorId: 3,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uPositionScale: 0.045,
    uVelocityScale: 0.01,
    uBaseTimeFactor: 0.1,
  },
  chen: {
    uAttractorId: 4,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uPositionScale: 0.03,
    uVelocityScale: 0.001,
    uBaseTimeFactor: 0.11,
  },
  lorenz83: {
    uAttractorId: 5,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uPositionScale: 0.15,
    uVelocityScale: 0.01,
    uBaseTimeFactor: 0.1,
  },
  rossler: {
    uAttractorId: 6,
    uSystemCenter: new THREE.Vector3(0, 0, 12),
    uPositionScale: 0.03,
    uVelocityScale: 0.01,
    uBaseTimeFactor: 0.1,
  },
  halvorsen: {
    uAttractorId: 7,
    uSystemCenter: new THREE.Vector3(-4, -4, -2),
    uPositionScale: 0.04,
    uVelocityScale: 0.01,
    uBaseTimeFactor: 0.1,
  },
  rabinovich_fabrikant: {
    uAttractorId: 8,
    uSystemCenter: new THREE.Vector3(0, 0, 1),
    uPositionScale: 0.2,
    uVelocityScale: 0.5,
    uBaseTimeFactor: 0.1,
  },
};

export const DEFAULT_ATTRACTOR_PARAMS: AttractorParams = {
  attractorName: "lorenz83",
  speedScale: 1.0,
  decayFactor: 0.1,
  noiseScale: 1.0,
  noiseTimeScale: 1.0,
  noiseIntensity: 0.01,
};

// WARNING: Do not reorder these values.
export const COLOR_MODES: Array<ColorMode> = [
  "single",
  "double",
  "triple",
  "rainbow",
  // "velocity",
  // "position",
  // "life",
  // "random",
];

export const DEFAULT_STYLE_PARAMS: StyleParams = {
  colorMode: "triple",
  color1: "#aa4f34",
  color2: "#90107b",
  color3: "#4c81de",
  blendCenter: 0.5,
  blendScale: 0.1,
  blendSharpness: 0.5,
  positionRandomization: 0.01,
};
