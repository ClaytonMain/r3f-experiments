import { shaderMaterial } from "@react-three/drei";
import fragmentShader from "./shaders/slimeMold/slimeMold.frag";
import vertexShader from "./shaders/slimeMold/slimeMold.vert";

export const SlimeMoldShaderMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  vertexShader,
  fragmentShader,
);
