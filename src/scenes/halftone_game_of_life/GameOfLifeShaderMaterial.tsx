import { shaderMaterial } from "@react-three/drei";
import fragmentShader from "./shaders/gameOfLife/gameOfLife.frag";
import vertexShader from "./shaders/gameOfLife/gameOfLife.vert";

export const GameOfLifeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  vertexShader,
  fragmentShader,
);
