import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import fragmentShader from "./shaders/slimeMold/slimeMold.frag";
import vertexShader from "./shaders/slimeMold/slimeMold.vert";

export const SlimeMoldShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uScreenResolution: new THREE.Vector2(100, 100),
    uPlaneResolution: new THREE.Vector2(100, 100),
    uGlPositionScale: 1.0,
  },
  vertexShader,
  fragmentShader,
);
