import * as THREE from "three";

export type AttractorName =
  | "lorenz"
  | "thomas"
  | "aizawa"
  | "dadras"
  | "chen"
  | "lorenz83"
  | "rossler"
  | "halvorsen"
  | "rabinovich_fabrikant";

export interface AttractorConfig {
  uAttractorId: number;
  uSystemCenter: THREE.Vector3;
  uPositionScale: number;
  uVelocityScale: number;
  uBaseTimeFactor: number;
}

export interface AttractorParams {
  attractorName: AttractorName;
  speedScale: number;
  decayFactor: number;
  noiseScale: number;
  noiseTimeScale: number;
  noiseIntensity: number;
}

export type AttractorConfigs = Record<AttractorName, AttractorConfig>;

export type ColorMode = "single" | "double" | "triple";
// | "rainbow"
// | "velocity"
// | "position"
// | "life"
// | "random"

export interface StyleParams {
  colorMode: ColorMode;
  color1: string;
  color2: string;
  color3: string;
  blendCenter: number;
  blendScale: number;
  blendSharpness: number;
  positionRandomization: number;
}

export type PartialNull<T> = {
  [P in keyof T]: T[P] | null;
};

export interface ParticlesUniforms {
  uTexturePosition: THREE.Uniform<THREE.Texture>;
  uTextureVelocity: THREE.Uniform<THREE.Texture>;
  uSystemCenter: THREE.Uniform<THREE.Vector3>;
  uPositionScale: THREE.Uniform<number>;
  uVelocityScale: THREE.Uniform<number>;
  uDpr: THREE.Uniform<number>;

  uColorMode: THREE.Uniform<number>;
  uColor1: THREE.Uniform<THREE.Color>;
  uColor2: THREE.Uniform<THREE.Color>;
  uColor3: THREE.Uniform<THREE.Color>;
  uBlendCenter: THREE.Uniform<number>;
  uBlendScale: THREE.Uniform<number>;
  uBlendSharpness: THREE.Uniform<number>;
  uPositionRandomization: THREE.Uniform<number>;
}

export interface PositionUniforms {
  uTime: THREE.Uniform<number>;
  uDelta: THREE.Uniform<number>;

  uSystemCenter: THREE.Uniform<THREE.Vector3>;
  uPositionScale: THREE.Uniform<number>;
  uVelocityScale: THREE.Uniform<number>;
  uBaseTimeFactor: THREE.Uniform<number>;

  uDecayFactor: THREE.Uniform<number>;
  uNoiseScale: THREE.Uniform<number>;
  uNoiseTimeScale: THREE.Uniform<number>;
  uNoiseIntensity: THREE.Uniform<number>;
}

export interface VelocityUniforms {
  uAttractorId: THREE.Uniform<number>;
  uSystemCenter: THREE.Uniform<THREE.Vector3>;
  uPositionScale: THREE.Uniform<number>;
  uVelocityScale: THREE.Uniform<number>;
  uBaseTimeFactor: THREE.Uniform<number>;

  uMinVelocity: THREE.Uniform<number>;
}
