import * as THREE from "three";
import { getTrailTexture } from "./dataTextureFunctions";
import fragmentShader from "./shaders/trail/trail.frag";
import vertexShader from "./shaders/trail/trail.vert";

class TrailMaterial extends THREE.ShaderMaterial {
  constructor(
    gpuTextureWidth: number,
    gpuTextureHeight: number,
    uniforms: { [uniform: string]: THREE.IUniform },
  ) {
    const trailTexture = getTrailTexture(gpuTextureWidth, gpuTextureHeight);

    const trailUniforms = {
      ...uniforms,
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
