import * as THREE from "three";

export const GPU_TEXTURE_WIDTH = 768;
export const GPU_TEXTURE_HEIGHT = 768;

export const DISPLAY_TEXTURE_WIDTH = 1920;
export const DISPLAY_TEXTURE_HEIGHT = 1080;

export const DEFAULT_SHARED_UNIFORMS = {
  // uBoundaryBehavior: { value: Math.round(Math.random()) }, // 0 = wrap, 1 = bounce
  uBoundaryBehavior: { value: 0 }, // 0 = wrap, 1 = bounce
};

export const DEFAULT_SIMULATION_SPEED = 2.7;

export const CONTROL_BOUNDS = {
  uSensorAngle: { min: 0.0, max: 180.0 },
  uRotationRate: { min: 0.0, max: 10.0 },
  uSensorOffset: { min: 0.0, max: 40.0 },
  uSensorWidth: { min: 0.0, max: 20.0 },
  uStepSize: { min: 0.0, max: 100.0 },
  uCrowdAvoidance: { min: 0.0, max: 1.0 },
  uWanderStrength: { min: 0.0, max: 20.0 },
  uDecayRate: { min: 0.0, max: 2.0 },
  uDepositRate: { min: 0.0, max: 30.0 },
  uDiffuseRate: { min: 0.0, max: 30.0 },
  simulationSpeed: { min: 0.1, max: 10.0 },
  uBorderDistance: { min: 0.0, max: 100.0 },
  uBorderSmoothing: { min: 0.0, max: 1.0 },
  uBorderStrength: { min: 0.0, max: 20.0 },
  uBorderRoundness: { min: 0.0, max: 200.0 },
};

const gaussValues = {
  uSensorAngle: { mu: 22.5, sigma: 5 },
  uRotationRate: { mu: 2, sigma: 0.4 },
  uSensorOffset: { mu: 15, sigma: 2 },
  uSensorWidth: { mu: 3, sigma: 0.2 },
  uStepSize: { mu: 12, sigma: 2 },
  uCrowdAvoidance: { mu: 0.2, sigma: 0.05 },
  uWanderStrength: { mu: 5, sigma: 1.2 },
  uDecayRate: { mu: 0.4, sigma: 0.1 },
  uDepositRate: { mu: 5, sigma: 1 },
  uDiffuseRate: { mu: 10, sigma: 2 },
  uBorderDistance: { mu: 50, sigma: 20 },
  uBorderSmoothing: { mu: 0.85, sigma: 0.5 },
  uBorderStrength: { mu: 8.5, sigma: 1 },
  uBorderRoundness: { mu: 120, sigma: 20 },
};

export const RANDOMIZE_FUNCTION_KEYS = [
  "uSensorAngle",
  "uRotationRate",
  "uSensorOffset",
  "uSensorWidth",
  "uStepSize",
  "uCrowdAvoidance",
  "uWanderStrength",
  "uDecayRate",
  "uDepositRate",
  "uDiffuseRate",
  "uBorderDistance",
  "uBorderSmoothing",
  "uBorderStrength",
  "uBorderRoundness",
];

export function getGaussRandomInControlBounds(
  key: keyof typeof CONTROL_BOUNDS,
  mu?: number,
  sigma?: number,
) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const min = CONTROL_BOUNDS[key].min;
  const max = CONTROL_BOUNDS[key].max;
  // @ts-expect-error Don't worry about it.
  const muValue = mu !== undefined ? mu : (gaussValues[key].mu ?? 0.5);
  const sigmaValue =
    // @ts-expect-error Don't worry about it.
    sigma !== undefined ? sigma : (gaussValues[key].sigma ?? 0.05);
  return Math.max(min, Math.min(max, muValue + z * sigmaValue));
}

export const DEFAULT_AGENT_DATA_UNIFORMS = {
  uAgentDataTexture: { value: null },
  uAgentPositionsTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: {
    value: getGaussRandomInControlBounds("uSensorAngle"),
  },
  uRotationRate: {
    value: getGaussRandomInControlBounds("uRotationRate"),
  },
  uSensorOffset: {
    value: getGaussRandomInControlBounds("uSensorOffset"),
  },
  uSensorWidth: {
    value: getGaussRandomInControlBounds("uSensorWidth"),
  },
  uStepSize: { value: getGaussRandomInControlBounds("uStepSize") },
  uCrowdAvoidance: {
    value: getGaussRandomInControlBounds("uCrowdAvoidance"),
  },
  uWanderStrength: {
    value: getGaussRandomInControlBounds("uWanderStrength"),
  },
  uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
  uTime: { value: 0.0 },
  uDelta: { value: 0.0 },
};

export const DEFAULT_AGENT_POSITIONS_UNIFORMS = {
  uAgentDataTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
};

export const DEFAULT_TRAIL_UNIFORMS = {
  uAgentPositionsTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDecayRate: { value: getGaussRandomInControlBounds("uDecayRate") },
  uDepositRate: { value: getGaussRandomInControlBounds("uDepositRate") },
  uDiffuseRate: { value: getGaussRandomInControlBounds("uDiffuseRate") },
  uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
  uBorderDistance: {
    value: getGaussRandomInControlBounds("uBorderDistance"),
  },
  uBorderSmoothing: {
    value: getGaussRandomInControlBounds("uBorderSmoothing"),
  },
  uBorderStrength: {
    value: getGaussRandomInControlBounds("uBorderStrength"),
  },
  uBorderRoundness: {
    value: getGaussRandomInControlBounds("uBorderRoundness"),
  },
  uDelta: { value: 0.0 },
  uTime: { value: 0.0 },
};
