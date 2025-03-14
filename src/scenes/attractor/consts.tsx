import * as THREE from "three";

import { AttractorConfigs, AttractorName } from "./types";

export const defaultNumberOfParticles = 100000;
export const textureWidth = Math.ceil(Math.sqrt(defaultNumberOfParticles));

export const ATTRACTOR_NAMES: Array<AttractorName> = [
  "lorenz",
  "thomas",
  "aizawa",
];

export const ATTRACTOR_CONFIGS: AttractorConfigs = {
  lorenz: {
    uAttractorId: 0,
    uSystemCenter: new THREE.Vector3(0, 0, 27),
    uPositionScale: 0.015,
    uVelocityScale: 0.001,
  },
  thomas: {
    uAttractorId: 1,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uPositionScale: 0.1,
    uVelocityScale: 0.1,
  },
  aizawa: {
    uAttractorId: 2,
    uSystemCenter: new THREE.Vector3(0.1, 0.1, 0.2),
    uPositionScale: 0.2,
    uVelocityScale: 0.5,
  },
};

export const DEFAULT_ATTRACTOR_NAME: AttractorName = "thomas";
