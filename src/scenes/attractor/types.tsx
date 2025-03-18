import * as THREE from "three";

export type AttractorName = "lorenz" | "thomas" | "aizawa" | "dadras" | "chen";

export interface AttractorConfig {
  uAttractorId: number | null;
  uSystemCenter: THREE.Vector3 | null;
  uPositionScale: number | null;
  uVelocityScale: number | null;
  uBaseTimeFactor: number | null;
}

export interface AttractorParams {
  attractorName: AttractorName | null;
  speedScale: number | null;
  decayFactor: number | null;
  noiseScale: number | null;
  noiseTimeScale: number | null;
  noiseIntensity: number | null;
}

export type AttractorConfigs = Record<AttractorName, AttractorConfig>;

export type ColorMode = "single" | "double" | "triple";
// | "rainbow"
// | "velocity"
// | "position"
// | "life"
// | "random"

export interface StyleParams {
  colorMode: ColorMode | null;
  color1: string | null;
  color2: string | null;
  color3: string | null;
  blendScale: number | null;
}
