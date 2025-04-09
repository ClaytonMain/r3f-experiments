import { shaderMaterial } from "@react-three/drei";
import fragmentShader from "./shaders/raymarching/raymarching.frag";
import vertexShader from "./shaders/raymarching/raymarching.vert";

export const ExperimentShaderMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  vertexShader,
  fragmentShader,
);
