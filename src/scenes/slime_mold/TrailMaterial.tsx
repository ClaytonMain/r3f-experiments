import * as THREE from "three";
import { DEFAULT_TRAIL_UNIFORMS } from "./consts";
import fragmentShader from "./shaders/trail/trail.frag";
import vertexShader from "./shaders/trail/trail.vert";

function getData(width: number, height: number) {
  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const i4 = i * 4;
    data[i4 + 0] = 0.0;
    data[i4 + 1] = 0.0;
    data[i4 + 2] = 0.0;
    data[i4 + 3] = 1.0;
  }
  return data;
}

class TrailMaterial extends THREE.ShaderMaterial {
  constructor(width: number, height: number) {
    const trailTexture = new THREE.DataTexture(
      getData(width, height),
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    trailTexture.needsUpdate = true;

    const trailUniforms = {
      ...DEFAULT_TRAIL_UNIFORMS,
      uTrailTexture: { value: trailTexture },
    };

    super({
      uniforms: trailUniforms,
      vertexShader,
      fragmentShader,
    });
  }
}

export default TrailMaterial;
