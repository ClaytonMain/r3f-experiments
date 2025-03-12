import * as THREE from "three";

export type AttractorName = "lorenz" | "thomas";

export interface AttractorConfig {
  uAttractorId: number;
  uPositionCalculationScale: number;
  uVelocityCalculationScale: number;
  uSystemCenter: THREE.Vector3;
  uSystemScale: number;
  deltaScale: number;
}

export type AttractorConfigs = Record<AttractorName, AttractorConfig>;
