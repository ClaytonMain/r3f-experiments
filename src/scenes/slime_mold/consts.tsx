import * as THREE from "three";

export const GPU_TEXTURE_WIDTH = 512;
export const GPU_TEXTURE_HEIGHT = 512;

// export const DISPLAY_TEXTURE_WIDTH = 1920;
// export const DISPLAY_TEXTURE_HEIGHT = 1080;

export const DISPLAY_TEXTURE_WIDTH = 3840;
export const DISPLAY_TEXTURE_HEIGHT = 2160;

// export const GPU_TEXTURE_WIDTH = 16;
// export const GPU_TEXTURE_HEIGHT = 16;

// export const DISPLAY_TEXTURE_WIDTH = 320;
// export const DISPLAY_TEXTURE_HEIGHT = 180;

export const DEFAULT_SHARED_UNIFORMS = {
  uBoundaryBehavior: { value: 1 }, // 0 = wrap, 1 = bounce
};

export const DEFAULT_SIMULATION_SPEED = 2.7;

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

export const DEFAULT_AGENT_DATA_UNIFORMS = {
  uAgentDataTexture: { value: null },
  uAgentPositionsTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: { value: Math.PI / 8 },
  uRotationRate: { value: 1.5 },
  uSensorOffset: { value: 15.2 },
  uSensorWidth: { value: 2.5 },
  uStepSize: { value: 12.0 },
  uCrowdAvoidance: { value: 0.15 },
  uWanderStrength: { value: 4.5 },
  uSensorSampleLevel: { value: 2 },
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

export const DEFAULT_TRAIL_UNIFORMS = {
  uAgentPositionsTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDecayRate: { value: 0.18 },
  uDepositRate: { value: 5.2 },
  uDiffuseRate: { value: 8.0 },
  uBoundaryBehavior: { value: DEFAULT_SHARED_UNIFORMS.uBoundaryBehavior.value },
  uBorderDistance: { value: 75.0 },
  uBorderSmoothing: { value: 0.85 },
  uBorderStrength: { value: 8.5 },
  uBorderRoundness: { value: 120.0 },
  uDelta: { value: 0.0 },
  uTime: { value: 0.0 },
};
