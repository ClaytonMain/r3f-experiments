export const radialSegments = 128;
export const tubularSegments = 1024;
export const textureWidth = Math.ceil(
  Math.sqrt(radialSegments * tubularSegments),
);
export const defaultRandomizationDensity = 0.3;
export const defaultStepDuration = 0.05;
export const defaultMaxSteps = 300;
