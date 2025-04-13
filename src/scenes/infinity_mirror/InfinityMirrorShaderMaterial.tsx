import { shaderMaterial } from "@react-three/drei";
import { uniformDefaults } from "./consts";
import fragmentShader from "./shaders/infinityMirror/infinityMirror.frag";
import vertexShader from "./shaders/infinityMirror/infinityMirror.vert";

export const InfinityMirrorShaderMaterial = shaderMaterial(
  uniformDefaults,
  vertexShader,
  fragmentShader,
);
