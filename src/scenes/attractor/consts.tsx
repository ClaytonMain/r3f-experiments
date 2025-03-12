import * as THREE from "three";

import { AttractorConfigs, AttractorName } from "./types";

export const defaultNumberOfParticles = 100000;
export const textureWidth = Math.ceil(Math.sqrt(defaultNumberOfParticles));

export const ATTRACTOR_NAMES: Array<AttractorName> = ["lorenz", "thomas"];

export const ATTRACTOR_CONFIGS: AttractorConfigs = {
  lorenz: {
    uAttractorId: 0,
    uSystemCenter: new THREE.Vector3(0, 0, 27),
    uSystemScale: 0.015,
    // deltaScale isn't affecting the scale of the values saved to the texture.
    // Need to change that, or add a different scale value.
    deltaScale: 0.01,
  },
  thomas: {
    uAttractorId: 1,
    uSystemCenter: new THREE.Vector3(0, 0, 0),
    uSystemScale: 0.1,
    deltaScale: 2,
  },
};
