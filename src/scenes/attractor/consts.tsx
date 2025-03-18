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
};

export const DEFAULT_ATTRACTOR_PARAMS: AttractorParams = {
  attractorName: "chen",
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
  // "rainbow",
  // "velocity",
  // "position",
  // "life",
  // "random",
];

export const DEFAULT_STYLE_PARAMS: StyleParams = {
  colorMode: "single",
  color1: "#ee5599",
  color2: "#bb4422",
  color3: "#ffcc00",
  blendScale: 0.5,
};
