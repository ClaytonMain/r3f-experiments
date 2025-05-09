import * as THREE from "three";

export const GPU_TEXTURE_WIDTH = 256;
export const GPU_TEXTURE_HEIGHT = 256;

export const DISPLAY_TEXTURE_WIDTH = 1920;
export const DISPLAY_TEXTURE_HEIGHT = 1080;

export const DEFAULT_AGENT_DATA_UNIFORMS = {
  uAgentDataTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uSensorAngle: { value: Math.PI / 4 },
  uRotationAngle: { value: Math.PI / 8 },
  uSensorOffset: { value: 9.0 },
  uSensorWidth: { value: 1.0 },
  uStepSize: { value: 2.0 },
  uTime: { value: 0.0 },
};

export const DEFAULT_AGENT_POSITIONS_UNIFORMS = {
  uAgentDataTexture: { value: null },
  uTrailTexture: { value: null },
  uDisplayTextureResolution: {
    value: new THREE.Vector2(DISPLAY_TEXTURE_WIDTH, DISPLAY_TEXTURE_HEIGHT),
  },
  uDepositRate: { value: 0.05 },
};

// In case I need this to be square.
// export const TRAIL_TEXTURE_WIDTH = Math.ceil(
//   Math.sqrt(DISPLAY_TEXTURE_WIDTH * DISPLAY_TEXTURE_HEIGHT),
// );
// export const TRAIL_TEXTURE_HEIGHT = TRAIL_TEXTURE_WIDTH;
