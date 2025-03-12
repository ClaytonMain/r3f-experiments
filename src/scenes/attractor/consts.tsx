import * as THREE from "three";

import { AttractorConfigs, AttractorName } from "./types";

export const defaultNumberOfParticles = 100000;
export const textureWidth = Math.ceil(Math.sqrt(defaultNumberOfParticles));
// export const uPositionCalculationScale = 0.01;
// export const uVelocityCalculationScale = 0.001;
// export const deltaScale = 0.25;
// export const deltaScale = 2.5;
// export const positionScale = 0.1;
// export const velocityScale = 0.1;

export const ATTRACTOR_NAMES: Array<AttractorName> = ["lorenz", "thomas"];

export const ATTRACTOR_CONFIGS: AttractorConfigs = {
  lorenz: {
    uAttractorId: 0,
    uPositionCalculationScale: 0.05,
    uVelocityCalculationScale: 0.1,
    uSystemCenter: new THREE.Vector3(0, 0, 27),
    uSystemScale: 1.0,
    deltaScale: 0.25,
  },
  thomas: {
    uAttractorId: 1,
    uPositionCalculationScale: 0.05,
    uVelocityCalculationScale: 0.1,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uSystemScale: 7.0,
    deltaScale: 2,
  },
};
