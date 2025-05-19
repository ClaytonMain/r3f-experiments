import * as THREE from "three";

// export const GPU_TEXTURE_WIDTH = 512;
// export const GPU_TEXTURE_HEIGHT = 512;

export const GPU_TEXTURE_WIDTH = 768;
export const GPU_TEXTURE_HEIGHT = 768;

// export const GPU_TEXTURE_WIDTH = 1024;
// export const GPU_TEXTURE_HEIGHT = 1024;

// export const DISPLAY_TEXTURE_WIDTH = 1920;
// export const DISPLAY_TEXTURE_HEIGHT = 1080;

export const DISPLAY_TEXTURE_WIDTH = 3840;
export const DISPLAY_TEXTURE_HEIGHT = 2160;

// export const GPU_TEXTURE_WIDTH = 16;
// export const GPU_TEXTURE_HEIGHT = 16;

// export const DISPLAY_TEXTURE_WIDTH = 320;
// export const DISPLAY_TEXTURE_HEIGHT = 180;

export const DEFAULT_SHARED_UNIFORMS = {
  uBoundaryBehavior: { value: Math.round(Math.random()) }, // 0 = wrap, 1 = bounce
};

export const DEFAULT_SIMULATION_SPEED = 2.7;

export const CONTROL_BOUNDS = {
  uSensorAngle: { min: 0.0, max: 180.0 },
  uRotationRate: { min: 0.0, max: 10.0 },
  uSensorOffset: { min: 0.0, max: 40.0 },
  uSensorWidth: { min: 0.0, max: 20.0 },
  uStepSize: { min: 0.0, max: 100.0 },
  uCrowdAvoidance: { min: 0.0, max: 2.0 },
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

export function getGaussRandomInControlBounds(
  key: keyof typeof CONTROL_BOUNDS,
  mu: number,
  sigma: number,
) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const min = CONTROL_BOUNDS[key].min;
  const max = CONTROL_BOUNDS[key].max;
  return Math.max(min, Math.min(max, mu + z * sigma));
}

// export const DEFAULT_AGENT_DATA_UNIFORMS = {
//   uAgentDataTexture: { value: null },
//   uAgentPositionsTexture: { value: null },
//   uTrailTexture: { value: null },
//   uDisplayTextureResolution: {
//     value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
//   },
//   uSensorAngle: { value: 0.43 },
//   uRotationRate: { value: 1.08 },
//   uSensorOffset: { value: 7.2 },
//   uSensorWidth: { value: 1.5 },
//   uStepSize: { value: 50.0 },
//   uCrowdAvoidance: { value: 0.05 },
//   uWanderStrength: { value: 0.2 },
//   uSensorSampleLevel: { value: 2 },
//   uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
//   uTime: { value: 0.0 },
//   uDelta: { value: 0.0 },
// };

// export const DEFAULT_AGENT_DATA_UNIFORMS = {
//   uAgentDataTexture: { value: null },
//   uAgentPositionsTexture: { value: null },
//   uTrailTexture: { value: null },
//   uDisplayTextureResolution: {
//     value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
//   },
//   uSensorAngle: { value: 0.76 },
//   uRotationRate: { value: 1.53 },
//   uSensorOffset: { value: 11.2 },
//   uSensorWidth: { value: 2.5 },
//   uStepSize: { value: 21.0 },
//   uCrowdAvoidance: { value: 0.44 },
//   uWanderStrength: { value: 3.1 },
//   uSensorSampleLevel: { value: 2 },
//   uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
//   uTime: { value: 0.0 },
//   uDelta: { value: 0.0 },
// };

// export const DEFAULT_AGENT_DATA_UNIFORMS = {
//   uAgentDataTexture: { value: null },
//   uAgentPositionsTexture: { value: null },
//   uTrailTexture: { value: null },
//   uDisplayTextureResolution: {
//     value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
//   },
//   uSensorAngle: { value: Math.PI / 8 },
//   uRotationRate: { value: 1.5 },
//   uSensorOffset: { value: 15.2 },
//   uSensorWidth: { value: 2.5 },
//   uStepSize: { value: 12.0 },
//   uCrowdAvoidance: { value: 0.15 },
//   uWanderStrength: { value: 4.5 },
//   uSensorSampleLevel: { value: 2 },
//   uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
//   uTime: { value: 0.0 },
//   uDelta: { value: 0.0 },
// };

export const DEFAULT_AGENT_DATA_UNIFORMS = {
  uAgentDataTexture: { value: null },
  uAgentPositionsTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: {
    value: getGaussRandomInControlBounds("uSensorAngle", 22.5, 5),
  },
  uRotationRate: {
    value: getGaussRandomInControlBounds("uRotationRate", 2, 0.4),
  },
  uSensorOffset: {
    value: getGaussRandomInControlBounds("uSensorOffset", 15, 2),
  },
  uSensorWidth: {
    value: getGaussRandomInControlBounds("uSensorWidth", 3, 0.2),
  },
  uStepSize: { value: getGaussRandomInControlBounds("uStepSize", 12, 2) },
  uCrowdAvoidance: {
    value: getGaussRandomInControlBounds("uCrowdAvoidance", 0.2, 0.05),
  },
  uWanderStrength: {
    value: getGaussRandomInControlBounds("uWanderStrength", 5, 1.2),
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

// export const DEFAULT_TRAIL_UNIFORMS = {
//   uAgentPositionsTexture: { value: null },
//   uTrailTexture: { value: null },
//   uDisplayTextureResolution: {
//     value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
//   },
//   uDecayRate: { value: 0.05 },
//   uDepositRate: { value: 15.0 },
//   uDiffuseRate: { value: 7.0 },
//   uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
//   uDelta: { value: 0.0 },
//   uTime: { value: 0.0 },
// };

// export const DEFAULT_TRAIL_UNIFORMS = {
//   uAgentPositionsTexture: { value: null },
//   uTrailTexture: { value: null },
//   uDisplayTextureResolution: {
//     value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
//   },
//   uDecayRate: { value: 0.81 },
//   uDepositRate: { value: 1.4 },
//   uDiffuseRate: { value: 18.4 },
//   uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
//   uDelta: { value: 0.0 },
//   uTime: { value: 0.0 },
// };

// export const DEFAULT_TRAIL_UNIFORMS = {
//   uAgentPositionsTexture: { value: null },
//   uTrailTexture: { value: null },
//   uDisplayTextureResolution: {
//     value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
//   },
//   uDecayRate: { value: 0.18 },
//   uDepositRate: { value: 5.2 },
//   uDiffuseRate: { value: 8.0 },
//   uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
//   uBorderDistance: { value: 75.0 },
//   uBorderSmoothing: { value: 0.85 },
//   uBorderStrength: { value: 8.5 },
//   uBorderRoundness: { value: 120.0 },
//   uDelta: { value: 0.0 },
//   uTime: { value: 0.0 },
// };

export const DEFAULT_TRAIL_UNIFORMS = {
  uAgentPositionsTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDecayRate: { value: getGaussRandomInControlBounds("uDecayRate", 0.4, 0.1) },
  uDepositRate: { value: getGaussRandomInControlBounds("uDepositRate", 5, 1) },
  uDiffuseRate: { value: getGaussRandomInControlBounds("uDiffuseRate", 10, 2) },
  uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
  uBorderDistance: {
    value: getGaussRandomInControlBounds("uBorderDistance", 50, 20),
  },
  uBorderSmoothing: {
    value: getGaussRandomInControlBounds("uBorderSmoothing", 0.85, 0.5),
  },
  uBorderStrength: {
    value: getGaussRandomInControlBounds("uBorderStrength", 8.5, 1),
  },
  uBorderRoundness: {
    value: getGaussRandomInControlBounds("uBorderRoundness", 120, 20),
  },
  uDelta: { value: 0.0 },
  uTime: { value: 0.0 },
};
