import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import fragmentShader from "./shaders/raymarching/raymarching.frag";
import vertexShader from "./shaders/raymarching/raymarching.vert";

export const ExperimentShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uCameraPosition: new THREE.Vector3(0, 0, 0),
    // @ts-expect-error doesn't like Euler
    uCameraRotation: new THREE.Euler(0, 0, 0),
    uResolution: new THREE.Vector2(100, 100),
  },
  vertexShader,
  fragmentShader,
);
